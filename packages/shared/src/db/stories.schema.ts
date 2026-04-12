import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import type { Transcription } from "../schemas/transcription.schema.js";

export const storiesSchema = pgTable("stories", {
  id: serial("id").primaryKey(),
  videoId: integer("video_id"),
  title: varchar("title", { length: 200 }).notNull(),
  altTitle: varchar("alt_title", { length: 200 }).notNull(),
  level: varchar("level", { length: 50 }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  audioPath: varchar("audio_path", { length: 500 }),
  audioFilename: varchar("audio_filename", { length: 200 }),
  pdfLightPath: varchar("pdf_light_path", { length: 500 }),
  pdfDarkPath: varchar("pdf_dark_path", { length: 500 }),
  transcription: jsonb("transcription").$type<Transcription>(),
  slug: varchar("slug", { length: 300 }).unique(),
  videoLink: varchar("video_link", { length: 500 }),
  isPremium: boolean("is_premium").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Story = typeof storiesSchema.$inferSelect;
