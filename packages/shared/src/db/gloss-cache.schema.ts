import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

// Fast machine-translation gloss cache. Unlike translation_cache (keyed by
// phrase + story/news), the gloss is context-free, so it is cached globally
// by phrase and reused across every story and news item.
export const glossCacheSchema = pgTable("gloss_cache", {
  id: serial("id").primaryKey(),
  phrase: text("phrase").notNull().unique(),
  gloss: text("gloss").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type GlossCache = typeof glossCacheSchema.$inferSelect;
