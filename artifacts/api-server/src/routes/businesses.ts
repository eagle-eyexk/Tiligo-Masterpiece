import { Router } from "express";
import { db } from "@workspace/db";
import { businessesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  ListBusinessesQueryParams,
  CreateBusinessBody,
  GetBusinessParams,
  UpdateBusinessParams,
  UpdateBusinessBody,
  DeleteBusinessParams,
  LoginBusinessBody,
} from "@workspace/api-zod";

const router = Router();

router.get("/businesses", async (req, res) => {
  try {
    const query = ListBusinessesQueryParams.parse(req.query);
    let conditions: any[] = [];
    if (query.status) conditions.push(eq(businessesTable.status, query.status));
    if (query.category) conditions.push(eq(businessesTable.category, query.category));
    const rows = await db
      .select()
      .from(businessesTable)
      .where(conditions.length ? and(...conditions) : undefined);
    res.json(rows.map(({ password_hash, ...b }) => b));
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/businesses", async (req, res) => {
  try {
    const body = CreateBusinessBody.parse(req.body);
    const [row] = await db
      .insert(businessesTable)
      .values({
        name: body.name,
        description: body.description,
        category: body.category,
        image_url: body.image_url,
        address: body.address,
        phone: body.phone,
        password_hash: body.password,
        delivery_fee: body.delivery_fee,
        delivery_time: body.delivery_time,
        status: "pending",
        is_open: false,
      })
      .returning();
    const { password_hash, ...result } = row;
    res.status(201).json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/businesses/:id", async (req, res) => {
  try {
    const { id } = GetBusinessParams.parse({ id: Number(req.params.id) });
    const [row] = await db.select().from(businessesTable).where(eq(businessesTable.id, id));
    if (!row) return res.status(404).json({ error: "Not found" });
    const { password_hash, ...result } = row;
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.patch("/businesses/:id", async (req, res) => {
  try {
    const { id } = UpdateBusinessParams.parse({ id: Number(req.params.id) });
    const body = UpdateBusinessBody.parse(req.body);
    const [row] = await db
      .update(businessesTable)
      .set(body)
      .where(eq(businessesTable.id, id))
      .returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    const { password_hash, ...result } = row;
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/businesses/:id", async (req, res) => {
  try {
    const { id } = DeleteBusinessParams.parse({ id: Number(req.params.id) });
    await db.delete(businessesTable).where(eq(businessesTable.id, id));
    res.status(204).send();
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/businesses/login", async (req, res) => {
  try {
    const { phone, password } = LoginBusinessBody.parse(req.body);
    const [row] = await db
      .select()
      .from(businessesTable)
      .where(eq(businessesTable.phone, phone));
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
