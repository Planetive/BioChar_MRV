import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, assuranceIssuesTable } from "@workspace/db";
import {
  ListAssuranceIssuesResponse,
  ListAssuranceIssuesQueryParams,
  CreateAssuranceIssueBody,
  CreateAssuranceIssueResponse,
  UpdateAssuranceIssueParams,
  UpdateAssuranceIssueBody,
  UpdateAssuranceIssueResponse,
  ResolveAssuranceIssueParams,
  ResolveAssuranceIssueBody,
  ResolveAssuranceIssueResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/assurance-issues", async (req, res): Promise<void> => {
  const qp = ListAssuranceIssuesQueryParams.safeParse(req.query);
  const conditions = [];
  if (qp.success) {
    if (qp.data.batchId != null) conditions.push(eq(assuranceIssuesTable.batchId, qp.data.batchId));
    if (qp.data.siteId != null) conditions.push(eq(assuranceIssuesTable.siteId, qp.data.siteId));
    if (qp.data.status) conditions.push(eq(assuranceIssuesTable.status, qp.data.status));
    if (qp.data.severity) conditions.push(eq(assuranceIssuesTable.severity, qp.data.severity));
  }
  const issues = conditions.length
    ? await db.select().from(assuranceIssuesTable).where(and(...conditions)).orderBy(assuranceIssuesTable.createdAt)
    : await db.select().from(assuranceIssuesTable).orderBy(assuranceIssuesTable.createdAt);
  res.json(ListAssuranceIssuesResponse.parse(issues));
});

router.post("/assurance-issues", async (req, res): Promise<void> => {
  const parsed = CreateAssuranceIssueBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [issue] = await db.insert(assuranceIssuesTable).values({ ...parsed.data, status: "open" }).returning();
  res.status(201).json(CreateAssuranceIssueResponse.parse(issue));
});

router.patch("/assurance-issues/:id", async (req, res): Promise<void> => {
  const params = UpdateAssuranceIssueParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateAssuranceIssueBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [issue] = await db.update(assuranceIssuesTable).set(parsed.data).where(eq(assuranceIssuesTable.id, params.data.id)).returning();
  if (!issue) {
    res.status(404).json({ error: "Assurance issue not found" });
    return;
  }
  res.json(UpdateAssuranceIssueResponse.parse(issue));
});

router.post("/assurance-issues/:id/resolve", async (req, res): Promise<void> => {
  const params = ResolveAssuranceIssueParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = ResolveAssuranceIssueBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [issue] = await db.update(assuranceIssuesTable).set({
    status: "resolved",
    resolvedAt: new Date(),
    resolvedBy: parsed.data.resolvedBy,
    resolution: parsed.data.resolution,
  }).where(eq(assuranceIssuesTable.id, params.data.id)).returning();
  if (!issue) {
    res.status(404).json({ error: "Assurance issue not found" });
    return;
  }
  res.json(ResolveAssuranceIssueResponse.parse(issue));
});

export default router;
