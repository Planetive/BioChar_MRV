import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, batchesTable, auditEventsTable } from "@workspace/db";
import {
  ListBatchesResponse,
  ListBatchesQueryParams,
  CreateBatchBody,
  CreateBatchResponse,
  GetBatchParams,
  GetBatchResponse,
  UpdateBatchParams,
  UpdateBatchBody,
  UpdateBatchResponse,
  AdvanceBatchStageParams,
  AdvanceBatchStageResponse,
} from "@workspace/api-zod";

const STAGES = ["collect", "quantify", "assurance", "verify", "comply", "report"];

const router: IRouter = Router();

router.get("/batches", async (req, res): Promise<void> => {
  const qp = ListBatchesQueryParams.safeParse(req.query);
  const conditions = [];
  if (qp.success) {
    if (qp.data.siteId != null) conditions.push(eq(batchesTable.siteId, qp.data.siteId));
    if (qp.data.stage) conditions.push(eq(batchesTable.stage, qp.data.stage));
    if (qp.data.status) conditions.push(eq(batchesTable.status, qp.data.status));
  }
  const batches = conditions.length
    ? await db.select().from(batchesTable).where(and(...conditions)).orderBy(batchesTable.createdAt)
    : await db.select().from(batchesTable).orderBy(batchesTable.createdAt);
  res.json(ListBatchesResponse.parse(batches));
});

router.post("/batches", async (req, res): Promise<void> => {
  const parsed = CreateBatchBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [batch] = await db.insert(batchesTable).values({ ...parsed.data as any, stage: "collect", status: "in_progress" }).returning();
  await db.insert(auditEventsTable).values({
    batchId: batch.id,
    siteId: batch.siteId,
    entityType: "batch",
    entityId: batch.id,
    action: "created",
    actor: "system",
    description: `Batch ${batch.batchCode} created and entered Collect stage`,
  });
  res.status(201).json(CreateBatchResponse.parse(batch));
});

router.get("/batches/:id", async (req, res): Promise<void> => {
  const params = GetBatchParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [batch] = await db.select().from(batchesTable).where(eq(batchesTable.id, params.data.id));
  if (!batch) {
    res.status(404).json({ error: "Batch not found" });
    return;
  }
  res.json(GetBatchResponse.parse(batch));
});

router.patch("/batches/:id", async (req, res): Promise<void> => {
  const params = UpdateBatchParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateBatchBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [batch] = await db.update(batchesTable).set(parsed.data as any).where(eq(batchesTable.id, params.data.id)).returning();
  if (!batch) {
    res.status(404).json({ error: "Batch not found" });
    return;
  }
  res.json(UpdateBatchResponse.parse(batch));
});

router.post("/batches/:id/advance-stage", async (req, res): Promise<void> => {
  const params = AdvanceBatchStageParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [batch] = await db.select().from(batchesTable).where(eq(batchesTable.id, params.data.id));
  if (!batch) {
    res.status(404).json({ error: "Batch not found" });
    return;
  }
  const currentIdx = STAGES.indexOf(batch.stage);
  if (currentIdx === STAGES.length - 1) {
    res.status(400).json({ error: "Batch is already at the final stage" });
    return;
  }
  const nextStage = STAGES[currentIdx + 1];
  const [updated] = await db.update(batchesTable).set({ stage: nextStage, status: "in_progress" }).where(eq(batchesTable.id, params.data.id)).returning();
  await db.insert(auditEventsTable).values({
    batchId: updated.id,
    siteId: updated.siteId,
    entityType: "batch",
    entityId: updated.id,
    action: "stage_advanced",
    actor: "system",
    description: `Batch ${updated.batchCode} advanced from ${batch.stage} to ${nextStage}`,
  });
  res.json(AdvanceBatchStageResponse.parse(updated));
});

export default router;
