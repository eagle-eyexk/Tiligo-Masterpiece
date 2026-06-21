import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  ListOrdersQueryParams,
  CreateOrderBody,
  GetOrderParams,
  UpdateOrderParams,
  UpdateOrderBody,
  DeleteOrderParams,
  TrackOrderParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/orders/track/:code", async (req, res) => {
  try {
    const { code } = TrackOrderParams.parse({ code: req.params.code });
    const [row] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.order_code, code));
    if (!row) return res.status(404).json({ error: "Order not found" });
    res.json(row);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/orders", async (req, res) => {
  try {
    const query = ListOrdersQueryParams.parse(req.query);
    let conditions: any[] = [];
    if (query.business_id) conditions.push(eq(ordersTable.business_id, query.business_id));
    if (query.delivery_id) conditions.push(eq(ordersTable.delivery_id, query.delivery_id));
    if (query.customer_phone) conditions.push(eq(ordersTable.customer_phone, query.customer_phone));
    if (query.status) conditions.push(eq(ordersTable.status, query.status));
    const rows = await db
      .select()
      .from(ordersTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(ordersTable.created_at);
    res.json(rows);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/orders", async (req, res) => {
  try {
    const body = CreateOrderBody.parse(req.body);
    const [row] = await db.insert(ordersTable).values({
      ...body,
      items: body.items as any,
      status: "e_re",
    }).returning();
    res.status(201).json(row);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/orders/:id", async (req, res) => {
  try {
    const { id } = GetOrderParams.parse({ id: Number(req.params.id) });
    const [row] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.patch("/orders/:id", async (req, res) => {
  try {
    const { id } = UpdateOrderParams.parse({ id: Number(req.params.id) });
    const body = UpdateOrderBody.parse(req.body);
    const [row] = await db
      .update(ordersTable)
      .set(body)
      .where(eq(ordersTable.id, id))
      .returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/orders/:id", async (req, res) => {
  try {
    const { id } = DeleteOrderParams.parse({ id: Number(req.params.id) });
    await db.delete(ordersTable).where(eq(ordersTable.id, id));
    res.status(204).send();
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
