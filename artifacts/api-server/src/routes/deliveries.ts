import { Router } from "express";
import { db } from "@workspace/db";
import { deliveriesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  ListDeliveriesQueryParams,
  CreateDeliveryBody,
  UpdateDeliveryParams,
  UpdateDeliveryBody,
  DeleteDeliveryParams,
  LoginDeliveryBody,
} from "@workspace/api-zod";

const router = Router();

router.get("/deliveries", async (req, res) => {
  try {
    const query = ListDeliveriesQueryParams.parse(req.query);
    let conditions: any[] = [];
    if (query.status) conditions.push(eq(deliveriesTable.status, query.status));
    if (query.is_available !== undefined) conditions.push(eq(deliveriesTable.is_available, query.is_available));
    const rows = await db
      .select()
      .from(deliveriesTable)
      .where(conditions.length ? and(...conditions) : undefined);
    res.json(rows.map(({ password_hash, ...d }) => d));
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/deliveries", async (req, res) => {
  try {
    const body = CreateDeliveryBody.parse(req.body);
    const [row] = await db
      .insert(deliveriesTable)
      .values({
        name: body.name,
        phone: body.phone,
        vehicle: body.vehicle,
        image_url: body.image_url,
        password_hash: body.password,
        status: "pending",
        is_available: true,
      })
      .returning();
    const { password_hash, ...result } = row;
    res.status(201).json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.patch("/deliveries/:id", async (req, res) => {
  try {
    const { id } = UpdateDeliveryParams.parse({ id: Number(req.params.id) });
    const body = UpdateDeliveryBody.parse(req.body);
    const [row] = await db
      .update(deliveriesTable)
      .set(body)
      .where(eq(deliveriesTable.id, id))
      .returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    const { password_hash, ...result } = row;
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/deliveries/:id", async (req, res) => {
  try {
    const { id } = DeleteDeliveryParams.parse({ id: Number(req.params.id) });
    await db.delete(deliveriesTable).where(eq(deliveriesTable.id, id));
    res.status(204).send();
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/deliveries/login", async (req, res) => {
  try {
    const { phone, password } = LoginDeliveryBody.parse(req.body);
    const [row] = await db
      .select()
      .from(deliveriesTable)
      .where(eq(deliveriesTable.phone, phone));
    if (!row || row.password_hash !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const { password_hash, ...result } = row;
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
