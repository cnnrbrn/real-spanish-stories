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
import { storiesSchema } from "./stories.schema.js";

export const storyDownloadsSchema = pgTable(
  "story_downloads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    storyId: integer("story_id")
      .notNull()
      .references(() => storiesSchema.id, { onDelete: "cascade" }),
    kind: varchar("kind", { length: 16 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("story_downloads_user_story_kind_created_idx").on(
      table.userId,
      table.storyId,
      table.kind,
      table.createdAt,
    ),
  ],
);

export type StoryDownload = typeof storyDownloadsSchema.$inferSelect;
