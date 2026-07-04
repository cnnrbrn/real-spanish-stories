CREATE TABLE "news" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"title" varchar(200),
	"video_link" varchar(500),
	"transcript" text,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "news_date_unique" UNIQUE("date")
);
