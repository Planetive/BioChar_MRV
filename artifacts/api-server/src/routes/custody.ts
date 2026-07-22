import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, custodyRecordsTable } from "@workspace/db";
import {
  ListCustodyRecordsResponse,
  ListCustodyRecordsQueryParams,
  CreateCustodyRecordBody,
  CreateCustodyRecordResponse,
  UpdateCustodyRecordParams,
  UpdateCustodyRecordBody,
  UpdateCustodyRecordResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/custody-records", async (req, res): Promise<void> => {
  const qp = ListCustodyRecordsQueryParams.safeParse(req.query);
  const conditions = [];
  if (qp.success) {
    if (qp.data.batchId != null) conditions.push(eq(custodyRecordsTable.batchId, qp.data.batchId));
  }
  const records = conditions.length
    ? await db.select().from(custodyRecordsTable).where(and(...conditions)).orderBy(custodyRecordsTable.createdAt)
    : await db.select().from(custodyRecordsTable).orderBy(custodyRecordsTable.createdAt);
  res.json(ListCustodyRecordsResponse.parse(records));
});

router.post("/custody-records", async (req, res): Promise<void> => {
  const parsed = CreateCustodyRecordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [record] = await db.insert(custodyRecordsTable).values(parsed.data as any).returning();
  res.status(201).json(CreateCustodyRecordResponse.parse(record));
});

router.patch("/custody-records/:id", async (req, res): Promise<void> => {
  const params = UpdateCustodyRecordParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateCustodyRecordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [record] = await db.update(custodyRecordsTable).set(parsed.data as any).where(eq(custodyRecordsTable.id, params.data.id)).returning();
  if (!record) {
    res.status(404).json({ error: "Custody record not found" });
    return;
  }
  res.json(UpdateCustodyRecordResponse.parse(record));
});

export default router;
