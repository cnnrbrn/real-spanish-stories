import { serial, text, timestamp, varchar, pgTable } from "drizzle-orm/pg-core";

export const contactTable = pgTable("contact", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }),
  email: varchar("email", { length: 255 }).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
