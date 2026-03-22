"""
BullMQ worker that consumes transcription-local jobs from Redis.

Downloads audio from S3, transcribes with local WhisperX, and updates PostgreSQL.
"""

import asyncio
import json
import logging
import os
import tempfile
from datetime import datetime, timezone
from pathlib import Path

import boto3
import psycopg2
from bullmq import Worker

from transcriber import TranscriptionService

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("transcription-worker")

# Environment variables
REDIS_HOST = os.environ.get("REDIS_HOST", "localhost")
REDIS_PORT = int(os.environ.get("REDIS_PORT", "6379"))
DATABASE_URL = os.environ["DATABASE_URL"]
S3_BUCKET = os.environ["S3_BUCKET"]
AWS_REGION = os.environ.get("AWS_REGION", "us-east-1")
AWS_ACCESS_KEY_ID = os.environ.get("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.environ.get("AWS_SECRET_ACCESS_KEY")

# Singleton transcription service (keeps model loaded between jobs)
transcription_service = TranscriptionService()


def get_s3_client():
    return boto3.client(
        "s3",
        region_name=AWS_REGION,
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    )


def get_db_connection():
    db_url = DATABASE_URL
    if db_url.startswith("postgresql+asyncpg://"):
        db_url = db_url.replace("postgresql+asyncpg://", "postgresql://", 1)
    return psycopg2.connect(db_url)


def update_video_status(video_id: int, status: str, transcription_json: str | None = None, error_message: str | None = None):
    """Update video status in PostgreSQL."""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            if transcription_json:
                cur.execute(
                    "UPDATE videos SET status = %s, transcription_json = %s, error_message = NULL, updated_at = %s WHERE id = %s",
                    (status, transcription_json, datetime.now(timezone.utc), video_id),
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


async def process_job(job, token):
    """Process a transcription job."""
    data = job.data
    video_id = data["videoId"]
    audio_s3_key = data["audioPath"]

    logger.info(f"[{video_id}] Processing local transcription job")

    # Create temp file for audio download
    audio_suffix = Path(audio_s3_key).suffix or ".mp3"
    tmp_audio = tempfile.NamedTemporaryFile(suffix=audio_suffix, delete=False)
    tmp_audio_path = tmp_audio.name
    tmp_audio.close()

    try:
        # Download audio from S3
        download_from_s3(audio_s3_key, tmp_audio_path)

        # Transcribe
        result = transcription_service.transcribe_audio(tmp_audio_path)

        # Update database
        update_video_status(video_id, "transcribed", transcription_json=json.dumps(result))
        logger.info(f"[{video_id}] Transcription completed: {len(result['words'])} words")

    except Exception as e:
        logger.error(f"[{video_id}] Transcription failed: {e}", exc_info=True)
        update_video_status(video_id, "failed", error_message=str(e))
        raise

    finally:
        if os.path.exists(tmp_audio_path):
            os.unlink(tmp_audio_path)


async def main():
    logger.info(f"Starting transcription worker (Redis: {REDIS_HOST}:{REDIS_PORT})")

    worker = Worker(
        "transcription-local",
        process_job,
        {
            "connection": f"redis://{REDIS_HOST}:{REDIS_PORT}",
        },
    )

    logger.info("Worker listening for jobs on 'transcription-local' queue")

    while True:
        await asyncio.sleep(1)


if __name__ == "__main__":
    asyncio.run(main())
