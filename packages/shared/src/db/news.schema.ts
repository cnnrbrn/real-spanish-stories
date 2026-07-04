import {
  date,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const newsSchema = pgTable("news", {
  id: serial("id").primaryKey(),
  date: date("date").notNull().unique(),
  title: varchar("title", { length: 200 }),
  videoLink: varchar("video_link", { length: 500 }),
  transcript: text("transcript"),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type News = typeof newsSchema.$inferSelect;
