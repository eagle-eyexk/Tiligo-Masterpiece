import { Router } from "express";
import { db } from "@workspace/db";
import { settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpsertSettingBody } from "@workspace/api-zod";

const router = Router();

router.get("/settings", async (_req, res) => {
  try {
    const rows = await db.select().from(settingsTable);
    res.json(rows);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/settings", async (req, res) => {
  try {
    const body = UpsertSettingBody.parse(req.body);
    const [existing] = await db
      .select()
      .from(settingsTable)
      .where(eq(settingsTable.key, body.key));
    if (existing) {
      const [row] = await db
        .update(settingsTable)
        .set({ value: body.value, label: body.label })
        .where(eq(settingsTable.key, body.key))
        .returning();
      res.json(row);
    } else {
      const [row] = await db.insert(settingsTable).values(body).returning();
      res.json(row);
    }
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
