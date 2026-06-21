import { pgTable, serial, text, boolean, real, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  business_id: integer("business_id").notNull(),
  business_name: text("business_name"),
  name: text("name").notNull(),
  description: text("description"),
  price: real("price").notNull(),
  category: text("category"),
  image_url: text("image_url"),
  is_available: boolean("is_available").default(true).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, created_at: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
