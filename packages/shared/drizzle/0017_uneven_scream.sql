CREATE TABLE "gloss_cache" (
	"id" serial PRIMARY KEY NOT NULL,
	"phrase" text NOT NULL,
	"gloss" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "gloss_cache_phrase_unique" UNIQUE("phrase")
);
