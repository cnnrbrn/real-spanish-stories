ALTER TABLE "translation_cache" ALTER COLUMN "story_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "translation_cache" ADD COLUMN "news_id" integer;--> statement-breakpoint
ALTER TABLE "translation_cache" ADD CONSTRAINT "translation_cache_news_id_news_id_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE no action ON UPDATE no action;