import { pgTable, serial, text, boolean, real, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const offersTable = pgTable("offers", {
  id: serial("id").primaryKey(),
  business_id: integer("business_id").notNull(),
  business_name: text("business_name"),
  title: text("title").notNull(),
  description: text("description"),
  original_price: real("original_price"),
  offer_price: real("offer_price").notNull(),
  image_url: text("image_url"),
  items_included: text("items_included").array(),
  badge: text("badge"),
  valid_until: text("valid_until"),
  is_active: boolean("is_active").default(true).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertOfferSchema = createInsertSchema(offersTable).omit({ id: true, created_at: true });
export type InsertOffer = z.infer<typeof insertOfferSchema>;
export type Offer = typeof offersTable.$inferSelect;
