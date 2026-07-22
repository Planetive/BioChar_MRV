import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, creditAllocationsTable, modelRunsTable } from "@workspace/db";
import {
  ListCreditAllocationsResponse,
  ListCreditAllocationsQueryParams,
  CreateCreditAllocationBody,
  CreateCreditAllocationResponse,
  GetCreditAllocationParams,
  GetCreditAllocationResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/credit-allocations", async (req, res): Promise<void> => {
  const qp = ListCreditAllocationsQueryParams.safeParse(req.query);
  const conditions = [];
  if (qp.success) {
    if (qp.data.batchId != null) conditions.push(eq(creditAllocationsTable.batchId, qp.data.batchId));
    if (qp.data.registry) conditions.push(eq(creditAllocationsTable.registry, qp.data.registry));
  }
  const allocs = conditions.length
    ? await db.select().from(creditAllocationsTable).where(and(...conditions)).orderBy(creditAllocationsTable.createdAt)
    : await db.select().from(creditAllocationsTable).orderBy(creditAllocationsTable.createdAt);
  res.json(ListCreditAllocationsResponse.parse(allocs));
});

router.post("/credit-allocations", async (req, res): Promise<void> => {
  const parsed = CreateCreditAllocationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [run] = await db.select().from(modelRunsTable).where(eq(modelRunsTable.id, parsed.data.modelRunId));
  if (!run) {
    res.status(404).json({ error: "Model run not found" });
    return;
  }
  const creditValue = parsed.data.creditValue ?? run.creditPrice ?? 100;
  const revenueUsd = run.netCo2e * creditValue;
  const [alloc] = await db.insert(creditAllocationsTable).values({
    batchId: parsed.data.batchId,
    modelRunId: parsed.data.modelRunId,
    registry: parsed.data.registry,
    netCo2e: run.netCo2e,
    creditValue,
    revenueUsd,
    status: "pending",
  }).returning();
  res.status(201).json(CreateCreditAllocationResponse.parse(alloc));
});

router.get("/credit-allocations/:id", async (req, res): Promise<void> => {
  const params = GetCreditAllocationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [alloc] = await db.select().from(creditAllocationsTable).where(eq(creditAllocationsTable.id, params.data.id));
  if (!alloc) {
    res.status(404).json({ error: "Credit allocation not found" });
    return;
  }
  res.json(GetCreditAllocationResponse.parse(alloc));
});

export default router;
