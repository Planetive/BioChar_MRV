import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, feedstockEntriesTable } from "@workspace/db";
import {
  ListFeedstockEntriesResponse,
  ListFeedstockEntriesQueryParams,
  CreateFeedstockEntryBody,
  CreateFeedstockEntryResponse,
  UpdateFeedstockEntryParams,
  UpdateFeedstockEntryBody,
  UpdateFeedstockEntryResponse,
  DeleteFeedstockEntryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/feedstock-entries", async (req, res): Promise<void> => {
  const qp = ListFeedstockEntriesQueryParams.safeParse(req.query);
  const conditions = [];
  if (qp.success) {
    if (qp.data.batchId != null) conditions.push(eq(feedstockEntriesTable.batchId, qp.data.batchId));
  }
  const entries = conditions.length
    ? await db.select().from(feedstockEntriesTable).where(and(...conditions)).orderBy(feedstockEntriesTable.createdAt)
    : await db.select().from(feedstockEntriesTable).orderBy(feedstockEntriesTable.createdAt);
  res.json(ListFeedstockEntriesResponse.parse(entries));
});

router.post("/feedstock-entries", async (req, res): Promise<void> => {
  const parsed = CreateFeedstockEntryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [entry] = await db.insert(feedstockEntriesTable).values(parsed.data as any).returning();
  res.status(201).json(CreateFeedstockEntryResponse.parse(entry));
});

router.patch("/feedstock-entries/:id", async (req, res): Promise<void> => {
  const params = UpdateFeedstockEntryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateFeedstockEntryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [entry] = await db.update(feedstockEntriesTable).set(parsed.data as any).where(eq(feedstockEntriesTable.id, params.data.id)).returning();
  if (!entry) {
    res.status(404).json({ error: "Feedstock entry not found" });
    return;
  }
  res.json(UpdateFeedstockEntryResponse.parse(entry));
});

router.delete("/feedstock-entries/:id", async (req, res): Promise<void> => {
  const params = DeleteFeedstockEntryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [entry] = await db.delete(feedstockEntriesTable).where(eq(feedstockEntriesTable.id, params.data.id)).returning();
  if (!entry) {
    res.status(404).json({ error: "Feedstock entry not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
