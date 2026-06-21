import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  ListProductsQueryParams,
  CreateProductBody,
  UpdateProductParams,
  UpdateProductBody,
  DeleteProductParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/products", async (req, res) => {
  try {
    const query = ListProductsQueryParams.parse(req.query);
    let conditions: any[] = [];
    if (query.business_id) conditions.push(eq(productsTable.business_id, query.business_id));
    if (query.is_available !== undefined) conditions.push(eq(productsTable.is_available, query.is_available));
    const rows = await db
      .select()
      .from(productsTable)
      .where(conditions.length ? and(...conditions) : undefined);
    res.json(rows);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/products", async (req, res) => {
  try {
    const body = CreateProductBody.parse(req.body);
    const [row] = await db.insert(productsTable).values(body).returning();
    res.status(201).json(row);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.patch("/products/:id", async (req, res) => {
  try {
    const { id } = UpdateProductParams.parse({ id: Number(req.params.id) });
    const body = UpdateProductBody.parse(req.body);
    const [row] = await db
      .update(productsTable)
      .set(body)
      .where(eq(productsTable.id, id))
      .returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/products/:id", async (req, res) => {
  try {
    const { id } = DeleteProductParams.parse({ id: Number(req.params.id) });
    await db.delete(productsTable).where(eq(productsTable.id, id));
    res.status(204).send();
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
