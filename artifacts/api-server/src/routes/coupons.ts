import { Router } from "express";
import { db } from "@workspace/db";
import { couponsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateCouponBody,
  UpdateCouponParams,
  UpdateCouponBody,
  DeleteCouponParams,
  ValidateCouponParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/coupons", async (_req, res) => {
  try {
    const rows = await db.select().from(couponsTable);
    res.json(rows);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/coupons", async (req, res) => {
  try {
    const body = CreateCouponBody.parse(req.body);
    const [row] = await db.insert(couponsTable).values(body).returning();
    res.status(201).json(row);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/coupons/validate/:code", async (req, res) => {
  try {
    const { code } = ValidateCouponParams.parse({ code: req.params.code });
    const [row] = await db
      .select()
      .from(couponsTable)
      .where(eq(couponsTable.code, code));
    if (!row || !row.is_active || row.uses_left <= 0) {
      return res.status(404).json({ error: "Invalid or expired coupon" });
    }
    res.json(row);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.patch("/coupons/:id", async (req, res) => {
  try {
    const { id } = UpdateCouponParams.parse({ id: Number(req.params.id) });
    const body = UpdateCouponBody.parse(req.body);
    const [row] = await db
      .update(couponsTable)
      .set(body)
      .where(eq(couponsTable.id, id))
      .returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/coupons/:id", async (req, res) => {
  try {
    const { id } = DeleteCouponParams.parse({ id: Number(req.params.id) });
    await db.delete(couponsTable).where(eq(couponsTable.id, id));
    res.status(204).send();
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
