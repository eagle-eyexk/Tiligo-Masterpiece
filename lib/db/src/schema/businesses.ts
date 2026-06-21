import { pgTable, serial, text, boolean, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const businessesTable = pgTable("businesses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"),
  image_url: text("image_url"),
  address: text("address"),
  phone: text("phone"),
  password_hash: text("password_hash"),
  is_open: boolean("is_open").default(false).notNull(),
  delivery_fee: real("delivery_fee"),
  delivery_time: text("delivery_time"),
  rating: real("rating"),
  status: text("status").default("pending").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertBusinessSchema = createInsertSchema(businessesTable).omit({ id: true, created_at: true });
export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type Business = typeof businessesTable.$inferSelect;
