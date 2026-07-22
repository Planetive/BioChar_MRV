import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, auditEventsTable } from "@workspace/db";
import {
  ListAuditEventsResponse,
  ListAuditEventsQueryParams,
  GetBatchAuditTrailParams,
  GetBatchAuditTrailResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/audit-events", async (req, res): Promise<void> => {
  const qp = ListAuditEventsQueryParams.safeParse(req.query);
  const conditions = [];
  if (qp.success) {
    if (qp.data.batchId != null) conditions.push(eq(auditEventsTable.batchId, qp.data.batchId));
    if (qp.data.siteId != null) conditions.push(eq(auditEventsTable.siteId, qp.data.siteId));
    if (qp.data.entityType) conditions.push(eq(auditEventsTable.entityType, qp.data.entityType));
  }
  const events = conditions.length
    ? await db.select().from(auditEventsTable).where(and(...conditions)).orderBy(auditEventsTable.createdAt)
    : await db.select().from(auditEventsTable).orderBy(auditEventsTable.createdAt);
  res.json(ListAuditEventsResponse.parse(events));
});

router.get("/audit-events/batch/:batchId", async (req, res): Promise<void> => {
  const params = GetBatchAuditTrailParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const events = await db.select().from(auditEventsTable).where(eq(auditEventsTable.batchId, params.data.batchId)).orderBy(auditEventsTable.createdAt);
  res.json(GetBatchAuditTrailResponse.parse(events));
});

export default router;
