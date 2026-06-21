import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const deliveriesTable = pgTable("deliveries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  vehicle: text("vehicle").notNull(),
  image_url: text("image_url"),
  password_hash: text("password_hash"),
  status: text("status").default("pending").notNull(),
  is_available: boolean("is_available").default(true).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertDeliverySchema = createInsertSchema(deliveriesTable).omit({ id: true, created_at: true });
export type InsertDelivery = z.infer<typeof insertDeliverySchema>;
export type Delivery = typeof deliveriesTable.$inferSelect;
