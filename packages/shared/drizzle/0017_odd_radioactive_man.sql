ALTER TABLE "news" ADD COLUMN "video_id" integer;--> statement-breakpoint
ALTER TABLE "news" ADD COLUMN "transcription" jsonb;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "content_type" varchar(20) DEFAULT 'story' NOT NULL;