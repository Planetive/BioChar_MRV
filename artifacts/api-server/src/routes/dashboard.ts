import { Router, type IRouter } from "express";
import { eq, and, count, sum, desc } from "drizzle-orm";
import { db, sitesTable, batchesTable, assuranceIssuesTable, complianceDeadlinesTable, creditAllocationsTable, modelRunsTable, auditEventsTable } from "@workspace/db";
import {
  GetDashboardSummaryResponse,
  GetPipelineSummaryResponse,
  GetRecentActivityResponse,
  GetRecentActivityQueryParams,
  GetRegistryComparisonResponse,
  GetComplianceHealthResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const sites = await db.select().from(sitesTable);
  const batches = await db.select().from(batchesTable);
  const issues = await db.select().from(assuranceIssuesTable);
  const deadlines = await db.select().from(complianceDeadlinesTable);
  const allocations = await db.select().from(creditAllocationsTable);

  const activeBatches = batches.filter(b => b.status === "in_progress" || b.status === "blocked").length;
  const totalNetCo2e = allocations.reduce((s, a) => s + (a.netCo2e ?? 0), 0);
  const totalRevenueUsd = allocations.reduce((s, a) => s + (a.revenueUsd ?? 0), 0);
  const openIssues = issues.filter(i => i.status === "open" || i.status === "in_review").length;
  const criticalIssues = issues.filter(i => i.severity === "critical" && (i.status === "open" || i.status === "in_review")).length;
  const upcomingDeadlines = deadlines.filter(d => d.status === "upcoming" || d.status === "due_soon").length;
  const overdueDeadlines = deadlines.filter(d => d.status === "overdue").length;
  const issuedCredits = allocations.filter(a => a.status === "issued").reduce((s, a) => s + (a.netCo2e ?? 0), 0);
  const pendingCredits = allocations.filter(a => a.status === "pending").reduce((s, a) => s + (a.netCo2e ?? 0), 0);

  const siteBreakdown = sites.map(site => {
    const siteBatches = batches.filter(b => b.siteId === site.id);
    const siteAllocs = allocations.filter(a => siteBatches.some(b => b.id === a.batchId));
    const siteIssues = issues.filter(i => i.siteId === site.id && (i.status === "open" || i.status === "in_review"));
    const siteDeadlines = deadlines.filter(d => d.siteId === site.id);
    const completedDeadlines = siteDeadlines.filter(d => d.status === "completed").length;
    const complianceScore = siteDeadlines.length > 0 ? Math.round((completedDeadlines / siteDeadlines.length) * 100) : 100;
    return {
      siteId: site.id,
      siteName: site.name,
      batchCount: siteBatches.length,
      netCo2e: siteAllocs.reduce((s, a) => s + (a.netCo2e ?? 0), 0),
      revenueUsd: siteAllocs.reduce((s, a) => s + (a.revenueUsd ?? 0), 0),
      openIssues: siteIssues.length,
      complianceScore,
    };
  });

  res.json(GetDashboardSummaryResponse.parse({
    totalSites: sites.length,
    totalBatches: batches.length,
    activeBatches,
    totalNetCo2e,
    totalRevenueUsd,
    openIssues,
    criticalIssues,
    upcomingDeadlines,
    overdueDeadlines,
    issuedCredits,
    pendingCredits,
    siteBreakdown,
  }));
});

router.get("/dashboard/pipeline", async (_req, res): Promise<void> => {
  const batches = await db.select().from(batchesTable);
  const stageCounts = {
    collect: 0, quantify: 0, assurance: 0, verify: 0, comply: 0, report: 0,
  };
  batches.forEach(b => {
    if (b.stage in stageCounts) {
      stageCounts[b.stage as keyof typeof stageCounts]++;
    }
  });
  res.json(GetPipelineSummaryResponse.parse(stageCounts));
});

router.get("/dashboard/activity", async (req, res): Promise<void> => {
  const qp = GetRecentActivityQueryParams.safeParse(req.query);
  const limit = qp.success && qp.data.limit ? qp.data.limit : 20;
  const events = await db.select().from(auditEventsTable).orderBy(desc(auditEventsTable.createdAt)).limit(limit);

  const batches = await db.select().from(batchesTable);
  const sites = await db.select().from(sitesTable);

  const batchMap = new Map(batches.map(b => [b.id, b]));
  const siteMap = new Map(sites.map(s => [s.id, s]));

  const items = events.map(e => {
    const batch = e.batchId ? batchMap.get(e.batchId) : null;
    const site = e.siteId ? siteMap.get(e.siteId) : null;
    return {
      id: e.id,
      type: e.action,
      description: e.description ?? e.action,
      actor: e.actor,
      batchId: e.batchId ?? null,
      batchCode: batch?.batchCode ?? null,
      siteId: e.siteId ?? null,
      siteName: site?.name ?? null,
      timestamp: e.createdAt.toISOString(),
    };
  });
  res.json(GetRecentActivityResponse.parse(items));
});

router.get("/dashboard/registry-comparison", async (_req, res): Promise<void> => {
  const runs = await db.select().from(modelRunsTable);
  const registries = ["puro_earth", "verra", "ebc"];
  const summaries = registries.map(registry => {
    const regRuns = runs.filter(r => r.registry === registry && r.eligibility === "eligible");
    const totalCo2e = regRuns.reduce((s, r) => s + (r.netCo2e ?? 0), 0);
    const avgPrice = regRuns.length > 0 ? regRuns.reduce((s, r) => s + (r.creditPrice ?? 0), 0) / regRuns.length : 0;
    return {
      registry,
      eligibleBatches: regRuns.length,
      totalCo2e,
      totalRevenue: totalCo2e * avgPrice,
      avgCreditPrice: avgPrice,
    };
  });

  const top = summaries.sort((a, b) => b.totalRevenue - a.totalRevenue)[0];
  res.json(GetRegistryComparisonResponse.parse({
    topRecommendation: top?.registry ?? "puro_earth",
    registries: summaries,
  }));
});

router.get("/dashboard/compliance-health", async (_req, res): Promise<void> => {
  const deadlines = await db.select().from(complianceDeadlinesTable).orderBy(complianceDeadlinesTable.dueDate);
  const upcoming = deadlines.filter(d => d.status === "upcoming" || d.status === "due_soon").length;
  const overdue = deadlines.filter(d => d.status === "overdue").length;
  const conflicts = deadlines.filter(d => d.conflictsWith != null).length;
  const completed = deadlines.filter(d => d.status === "completed").length;
  const total = deadlines.length;
  const score = total > 0 ? Math.round(((total - overdue) / total) * 100) : 100;

  res.json(GetComplianceHealthResponse.parse({
    overallScore: score,
    upcomingCount: upcoming,
    overdueCount: overdue,
    conflictCount: conflicts,
    deadlines,
  }));
});

export default router;
