import { pgTable, serial, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { storiesSchema } from "./stories.schema.js";

export const translationCacheSchema = pgTable("translation_cache", {
  id: serial("id").primaryKey(),
  phrase: text("phrase").notNull(),
  storyId: integer("story_id")
    .notNull()
    .references(() => storiesSchema.id),
  translation: text("translation").notNull(),
  explanation: jsonb("explanation").$type<string[]>().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type TranslationCache = typeof translationCacheSchema.$inferSelect;
