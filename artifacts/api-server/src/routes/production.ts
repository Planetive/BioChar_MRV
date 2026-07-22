import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, productionRecordsTable } from "@workspace/db";
import {
  ListProductionRecordsResponse,
  ListProductionRecordsQueryParams,
  CreateProductionRecordBody,
  CreateProductionRecordResponse,
  UpdateProductionRecordParams,
  UpdateProductionRecordBody,
  UpdateProductionRecordResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/production-records", async (req, res): Promise<void> => {
  const qp = ListProductionRecordsQueryParams.safeParse(req.query);
  const conditions = [];
  if (qp.success) {
    if (qp.data.batchId != null) conditions.push(eq(productionRecordsTable.batchId, qp.data.batchId));
  }
  const records = conditions.length
    ? await db.select().from(productionRecordsTable).where(and(...conditions)).orderBy(productionRecordsTable.createdAt)
    : await db.select().from(productionRecordsTable).orderBy(productionRecordsTable.createdAt);
  res.json(ListProductionRecordsResponse.parse(records));
});

router.post("/production-records", async (req, res): Promise<void> => {
  const parsed = CreateProductionRecordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [record] = await db.insert(productionRecordsTable).values(parsed.data as any).returning();
  res.status(201).json(CreateProductionRecordResponse.parse(record));
});

router.patch("/production-records/:id", async (req, res): Promise<void> => {
  const params = UpdateProductionRecordParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateProductionRecordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [record] = await db.update(productionRecordsTable).set(parsed.data as any).where(eq(productionRecordsTable.id, params.data.id)).returning();
  if (!record) {
    res.status(404).json({ error: "Production record not found" });
    return;
  }
  res.json(UpdateProductionRecordResponse.parse(record));
});

export default router;
