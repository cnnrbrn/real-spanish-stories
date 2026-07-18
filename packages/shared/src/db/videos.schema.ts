import {
  boolean,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { VIDEO_STATUS_VALUES } from "../constants/video-status.js";
import { CONTENT_TYPE_VALUES } from "../constants/content-types.js";

export const videosSchema = pgTable("videos", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  altTitle: varchar("alt_title", { length: 200 }).notNull(),
  status: varchar("status", { length: 50 })
    .$type<(typeof VIDEO_STATUS_VALUES)[number]>()
    .notNull()
    .default("draft"),
  contentType: varchar("content_type", { length: 20 })
    .$type<(typeof CONTENT_TYPE_VALUES)[number]>()
    .notNull()
    .default("story"),
  level: varchar("level", { length: 50 }),
  useSpanishHeadings: boolean("use_spanish_headings").notNull().default(false),
  skipEnglishTitle: boolean("skip_english_title").notNull().default(false),
audioPath: varchar("audio_path", { length: 500 }),
  audioFilename: varchar("audio_filename", { length: 200 }),
  videoPath: varchar("video_path", { length: 500 }),
  transcriptionJson: text("transcription_json"),
  sectionsJson: text("sections_json"),
  languageTaggedJson: text("language_tagged_json"),
  transcriptionMarkdown: text("transcription_markdown"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  uniqueIndex("videos_alt_title_level_unique").on(t.altTitle, t.level),
]);

export type Video = typeof videosSchema.$inferSelect;
