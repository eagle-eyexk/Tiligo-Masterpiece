import { Router } from "express";
import { db } from "@workspace/db";
import { ticketsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateTicketBody,
  UpdateTicketParams,
  UpdateTicketBody,
  DeleteTicketParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/tickets", async (_req, res) => {
  try {
    const rows = await db.select().from(ticketsTable);
    res.json(rows);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/tickets", async (req, res) => {
  try {
    const body = CreateTicketBody.parse(req.body);
    const [row] = await db.insert(ticketsTable).values(body).returning();
    res.status(201).json(row);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.patch("/tickets/:id", async (req, res) => {
  try {
    const { id } = UpdateTicketParams.parse({ id: Number(req.params.id) });
    const body = UpdateTicketBody.parse(req.body);
    const [row] = await db
      .update(ticketsTable)
      .set(body)
      .where(eq(ticketsTable.id, id))
      .returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/tickets/:id", async (req, res) => {
  try {
    const { id } = DeleteTicketParams.parse({ id: Number(req.params.id) });
    await db.delete(ticketsTable).where(eq(ticketsTable.id, id));
    res.status(204).send();
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
