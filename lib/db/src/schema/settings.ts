import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const settingsTable = pgTable("app_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  label: text("label"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertSettingSchema = createInsertSchema(settingsTable).omit({ id: true, created_at: true });
export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type Setting = typeof settingsTable.$inferSelect;
