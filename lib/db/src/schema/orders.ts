import { pgTable, serial, text, boolean, real, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  order_code: text("order_code").notNull().unique(),
  business_id: integer("business_id").notNull(),
  business_name: text("business_name").notNull(),
  customer_name: text("customer_name").notNull(),
  customer_phone: text("customer_phone").notNull(),
  customer_address: text("customer_address").notNull(),
  customer_lat: real("customer_lat"),
  customer_lng: real("customer_lng"),
  notes: text("notes"),
  items: jsonb("items").notNull().$type<Array<{ id?: number | null; name: string; price: number; qty: number }>>(),
  total: real("total").notNull(),
  delivery_fee: real("delivery_fee").notNull().default(0),
  status: text("status").default("e_re").notNull(),
  payment_method: text("payment_method").default("cash").notNull(),
  priority: boolean("priority").default(false).notNull(),
  coupon_code: text("coupon_code"),
  discount: real("discount"),
  delivery_id: integer("delivery_id"),
  delivery_name: text("delivery_name"),
  delivery_lat: real("delivery_lat"),
  delivery_lng: real("delivery_lng"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, created_at: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
