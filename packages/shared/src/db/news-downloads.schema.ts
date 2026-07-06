import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { user } from "./auth.schema.js";
import { newsSchema } from "./news.schema.js";

export const newsDownloadsSchema = pgTable(
  "news_downloads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    newsId: integer("news_id")
      .notNull()
      .references(() => newsSchema.id, { onDelete: "cascade" }),
    kind: varchar("kind", { length: 16 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("news_downloads_user_news_kind_created_idx").on(
      table.userId,
      table.newsId,
      table.kind,
      table.createdAt,
    ),
  ],
);

export type NewsDownload = typeof newsDownloadsSchema.$inferSelect;
