import { Router } from "express";
import { db } from "@workspace/db";
import { offersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  ListOffersQueryParams,
  CreateOfferBody,
  UpdateOfferParams,
  UpdateOfferBody,
  DeleteOfferParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/offers", async (req, res) => {
  try {
    const query = ListOffersQueryParams.parse(req.query);
    let conditions: any[] = [];
    if (query.business_id) conditions.push(eq(offersTable.business_id, query.business_id));
    if (query.is_active !== undefined) conditions.push(eq(offersTable.is_active, query.is_active));
    const rows = await db
      .select()
      .from(offersTable)
      .where(conditions.length ? and(...conditions) : undefined);
    res.json(rows);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/offers", async (req, res) => {
  try {
    const body = CreateOfferBody.parse(req.body);
    const [row] = await db.insert(offersTable).values(body).returning();
    res.status(201).json(row);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.patch("/offers/:id", async (req, res) => {
  try {
    const { id } = UpdateOfferParams.parse({ id: Number(req.params.id) });
    const body = UpdateOfferBody.parse(req.body);
    const [row] = await db
      .update(offersTable)
      .set(body)
      .where(eq(offersTable.id, id))
      .returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/offers/:id", async (req, res) => {
  try {
    const { id } = DeleteOfferParams.parse({ id: Number(req.params.id) });
    await db.delete(offersTable).where(eq(offersTable.id, id));
    res.status(204).send();
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
