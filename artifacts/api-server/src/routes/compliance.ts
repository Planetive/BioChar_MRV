import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, complianceDeadlinesTable } from "@workspace/db";
import {
  ListComplianceDeadlinesResponse,
  ListComplianceDeadlinesQueryParams,
  CreateComplianceDeadlineBody,
  CreateComplianceDeadlineResponse,
  UpdateComplianceDeadlineParams,
  UpdateComplianceDeadlineBody,
  UpdateComplianceDeadlineResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/compliance-deadlines", async (req, res): Promise<void> => {
  const qp = ListComplianceDeadlinesQueryParams.safeParse(req.query);
  const conditions = [];
  if (qp.success) {
    if (qp.data.siteId != null) conditions.push(eq(complianceDeadlinesTable.siteId, qp.data.siteId));
    if (qp.data.registry) conditions.push(eq(complianceDeadlinesTable.registry, qp.data.registry));
    if (qp.data.status) conditions.push(eq(complianceDeadlinesTable.status, qp.data.status));
  }
  const deadlines = conditions.length
    ? await db.select().from(complianceDeadlinesTable).where(and(...conditions)).orderBy(complianceDeadlinesTable.dueDate)
    : await db.select().from(complianceDeadlinesTable).orderBy(complianceDeadlinesTable.dueDate);
  res.json(ListComplianceDeadlinesResponse.parse(deadlines));
});

router.post("/compliance-deadlines", async (req, res): Promise<void> => {
  const parsed = CreateComplianceDeadlineBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [deadline] = await db.insert(complianceDeadlinesTable).values({ ...parsed.data as any, status: "upcoming" }).returning();
  res.status(201).json(CreateComplianceDeadlineResponse.parse(deadline));
});

router.patch("/compliance-deadlines/:id", async (req, res): Promise<void> => {
  const params = UpdateComplianceDeadlineParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateComplianceDeadlineBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [deadline] = await db.update(complianceDeadlinesTable).set(parsed.data as any).where(eq(complianceDeadlinesTable.id, params.data.id)).returning();
  if (!deadline) {
    res.status(404).json({ error: "Compliance deadline not found" });
    return;
  }
  res.json(UpdateComplianceDeadlineResponse.parse(deadline));
});

export default router;
