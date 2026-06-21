import { pgTable, serial, text, boolean, real, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const couponsTable = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  description: text("description"),
  discount_amount: real("discount_amount").notNull(),
  uses_left: integer("uses_left").default(100).notNull(),
  is_active: boolean("is_active").default(true).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertCouponSchema = createInsertSchema(couponsTable).omit({ id: true, created_at: true });
export type InsertCoupon = z.infer<typeof insertCouponSchema>;
export type Coupon = typeof couponsTable.$inferSelect;
