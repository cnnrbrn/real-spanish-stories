"""
BullMQ worker that consumes video-generation jobs from Redis.

Downloads audio from S3, renders video with MoviePy, uploads result to S3,
and updates PostgreSQL with the video path and status.
"""

import asyncio
import logging
import os
import tempfile
from datetime import datetime, timezone
from pathlib import Path

import boto3
import psycopg2
from bullmq import Worker

from renderer import get_video_generation_service

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("video-generation-worker")

# Environment variables
REDIS_HOST = os.environ.get("REDIS_HOST", "localhost")
REDIS_PORT = int(os.environ.get("REDIS_PORT", "6379"))
DATABASE_URL = os.environ["DATABASE_URL"]
S3_BUCKET = os.environ["S3_BUCKET"]
AWS_REGION = os.environ.get("AWS_REGION", "us-east-1")
AWS_ACCESS_KEY_ID = os.environ.get("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.environ.get("AWS_SECRET_ACCESS_KEY")


def get_s3_client():
    return boto3.client(
        "s3",
        region_name=AWS_REGION,
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    )


def get_db_connection():
    # Convert SQLAlchemy-style URL to psycopg2 format if needed
    db_url = DATABASE_URL
    if db_url.startswith("postgresql+asyncpg://"):
        db_url = db_url.replace("postgresql+asyncpg://", "postgresql://", 1)
    return psycopg2.connect(db_url)


def update_video_status(video_id: int, status: str, video_path: str | None = None, error_message: str | None = None):
    """Update video status in PostgreSQL."""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            if video_path:
                cur.execute(
                    "UPDATE videos SET status = %s, video_path = %s, error_message = NULL, updated_at = %s WHERE id = %s",
                    (status, video_path, datetime.now(timezone.utc), video_id),
                )
            else:
                cur.execute(
                    "UPDATE videos SET status = %s, error_message = %s, updated_at = %s WHERE id = %s",
                    (status, error_message, datetime.now(timezone.utc), video_id),
                )
        conn.commit()
    finally:
        conn.close()


def download_from_s3(s3_key: str, local_path: str):
    """Download a file from S3 to a local path."""
    s3 = get_s3_client()
    logger.info(f"Downloading s3://{S3_BUCKET}/{s3_key} to {local_path}")
    s3.download_file(S3_BUCKET, s3_key, local_path)


def upload_to_s3(local_path: str, s3_key: str):
    """Upload a local file to S3."""
    s3 = get_s3_client()
    logger.info(f"Uploading {local_path} to s3://{S3_BUCKET}/{s3_key}")
    s3.upload_file(local_path, S3_BUCKET, s3_key, ExtraArgs={"ContentType": "video/mp4"})


async def process_job(job, token):
    """Process a video generation job."""
    data = job.data
    video_id = data["videoId"]
    title = data["title"]
    language_tagged_json = data["languageTaggedJson"]
    audio_s3_key = data["audioPath"]

    logger.info(f"[{video_id}] Processing video generation job")

    # Create temp file for audio download
    audio_suffix = Path(audio_s3_key).suffix or ".mp3"
    tmp_audio = tempfile.NamedTemporaryFile(suffix=audio_suffix, delete=False)
    tmp_audio_path = tmp_audio.name
    tmp_audio.close()

    try:
        # Download audio from S3
        download_from_s3(audio_s3_key, tmp_audio_path)

        # Render video (outputs to data/outputs/)
        service = get_video_generation_service(draft_mode=False)
        local_video_path = service.generate_video(
            video_id=video_id,
            title=title,
            language_tagged_json=language_tagged_json,
            audio_path=tmp_audio_path,
        )

        # Upload video to S3
        video_filename = Path(local_video_path).name
        s3_video_key = f"video/{video_filename}"
        upload_to_s3(local_video_path, s3_video_key)

        # Update database
        update_video_status(video_id, "completed", video_path=s3_video_key)
        logger.info(f"[{video_id}] Video generation completed: {s3_video_key}")

    except Exception as e:
        logger.error(f"[{video_id}] Video generation failed: {e}", exc_info=True)
        update_video_status(video_id, "failed", error_message=str(e))
        raise

    finally:
        # Clean up temp audio file (keep local video output)
        if os.path.exists(tmp_audio_path):
            os.unlink(tmp_audio_path)


async def main():
    logger.info(f"Starting video-generation worker (Redis: {REDIS_HOST}:{REDIS_PORT})")

    worker = Worker(
        "video-generation",
        process_job,
        {
            "connection": f"redis://{REDIS_HOST}:{REDIS_PORT}",
        },
    )

    logger.info("Worker listening for jobs on 'video-generation' queue")

    # Keep the worker running
    while True:
        await asyncio.sleep(1)


if __name__ == "__main__":
    asyncio.run(main())
