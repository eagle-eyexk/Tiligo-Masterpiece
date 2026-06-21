import { Router } from "express";
import { db } from "@workspace/db";
import {
  businessesTable,
  deliveriesTable,
  ordersTable,
  ticketsTable,
} from "@workspace/db";
import { eq, and, gte, sql } from "drizzle-orm";

const router = Router();

router.get("/dashboard/summary", async (_req, res) => {
  try {
    const [businesses, deliveries, orders, tickets] = await Promise.all([
      db.select().from(businessesTable),
      db.select().from(deliveriesTable),
      db.select().from(ordersTable),
      db.select().from(ticketsTable),
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeStatuses = ["e_re", "pranuar", "ne_pergatitje", "gati_per_dorezim", "ne_rruge"];

    const summary = {
      total_businesses: businesses.length,
      active_businesses: businesses.filter((b) => b.status === "approved").length,
      pending_businesses: businesses.filter((b) => b.status === "pending").length,
      total_couriers: deliveries.length,
      approved_couriers: deliveries.filter((d) => d.status === "approved").length,
      pending_couriers: deliveries.filter((d) => d.status === "pending").length,
      total_orders: orders.length,
      active_orders: orders.filter((o) => activeStatuses.includes(o.status)).length,
      delivered_orders: orders.filter((o) => o.status === "dorezuar").length,
      today_revenue: orders
        .filter((o) => o.status === "dorezuar" && new Date(o.created_at) >= today)
        .reduce((sum, o) => sum + o.total + (o.delivery_fee || 0), 0),
      total_revenue: orders
        .filter((o) => o.status === "dorezuar")
        .reduce((sum, o) => sum + o.total + (o.delivery_fee || 0), 0),
      open_tickets: tickets.filter((t) => t.status === "open").length,
    };

    res.json(summary);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
