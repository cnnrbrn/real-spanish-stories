import {
  date,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import type { Transcription } from "../schemas/transcription.schema.js";

export const newsSchema = pgTable("news", {
  id: serial("id").primaryKey(),
  date: date("date").notNull().unique(),
  videoId: integer("video_id"),
  title: varchar("title", { length: 200 }),
  metaDescription: varchar("meta_description", { length: 160 }),
  summary: text("summary"),
  listSummary: varchar("list_summary", { length: 300 }),
  videoLink: varchar("video_link", { length: 500 }),
  transcript: text("transcript"),
  transcription: jsonb("transcription").$type<Transcription>(),
  pdfPath: varchar("pdf_path", { length: 500 }),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type News = typeof newsSchema.$inferSelect;
