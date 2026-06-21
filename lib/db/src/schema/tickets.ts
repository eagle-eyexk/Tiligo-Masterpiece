import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ticketsTable = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  category: text("category"),
  priority: text("priority").default("medium").notNull(),
  status: text("status").default("open").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertTicketSchema = createInsertSchema(ticketsTable).omit({ id: true, created_at: true });
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type SupportTicket = typeof ticketsTable.$inferSelect;
