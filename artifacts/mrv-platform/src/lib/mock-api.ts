/**
 * Frontend mock API — used while the Express backend is archived.
 * Intercepts /api/* fetch calls and serves in-memory data.
 */

type Json = unknown;

const now = new Date().toISOString();
const daysAgo = (n: number) =>
  new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();

const store = {
  sites: [
    {
      id: 1,
      name: "Punjab Agro Hub",
      location: "Faisalabad, Punjab",
      country: "Pakistan",
      status: "active",
      timezone: "Asia/Karachi",
      createdAt: daysAgo(120),
      updatedAt: daysAgo(2),
    },
    {
      id: 2,
      name: "Sindh Biochar Yard",
      location: "Hyderabad, Sindh",
      country: "Pakistan",
      status: "active",
      timezone: "Asia/Karachi",
      createdAt: daysAgo(90),
      updatedAt: daysAgo(1),
    },
    {
      id: 3,
      name: "KP Pilot Kiln",
      location: "Peshawar, KP",
      country: "Pakistan",
      status: "pending",
      timezone: "Asia/Karachi",
      createdAt: daysAgo(30),
      updatedAt: daysAgo(5),
    },
  ],
  batches: [
    {
      id: 1,
      siteId: 1,
      batchCode: "BC-2025-001",
      description: "Rice husk pyrolysis — Q2 campaign",
      stage: "report",
      status: "allocated",
      productionDate: "2025-06-12",
      totalBiomassKg: 42000,
      totalBiocharKg: 12600,
      estimatedCo2e: 210.4,
      permanenceDiscount: 0.12,
      netCo2e: 183.5,
      assignedTo: "A. Khan",
      createdAt: daysAgo(40),
      updatedAt: daysAgo(1),
    },
    {
      id: 2,
      siteId: 2,
      batchCode: "NS-2025-001",
      description: "Cotton stalk feedstock",
      stage: "verify",
      status: "in_progress",
      productionDate: "2025-07-01",
      totalBiomassKg: 38000,
      totalBiocharKg: 11000,
      estimatedCo2e: 188.2,
      permanenceDiscount: 0.14,
      netCo2e: 160.9,
      assignedTo: "S. Malik",
      createdAt: daysAgo(25),
      updatedAt: daysAgo(2),
    },
    {
      id: 3,
      siteId: 1,
      batchCode: "BC-2025-002",
      description: "Mixed agri residue",
      stage: "assurance",
      status: "blocked",
      productionDate: "2025-07-08",
      totalBiomassKg: 29000,
      totalBiocharKg: 8200,
      estimatedCo2e: 142.0,
      permanenceDiscount: 0.15,
      netCo2e: 120.7,
      assignedTo: "A. Khan",
      createdAt: daysAgo(18),
      updatedAt: daysAgo(0),
    },
    {
      id: 4,
      siteId: 2,
      batchCode: "NS-2025-002",
      description: "Sugarcane bagasse run",
      stage: "quantify",
      status: "in_progress",
      productionDate: "2025-07-15",
      totalBiomassKg: 51000,
      totalBiocharKg: 14800,
      estimatedCo2e: 245.0,
      permanenceDiscount: 0.1,
      netCo2e: 220.5,
      assignedTo: "R. Ali",
      createdAt: daysAgo(10),
      updatedAt: daysAgo(1),
    },
    {
      id: 5,
      siteId: 3,
      batchCode: "KP-2025-001",
      description: "Pilot kiln validation",
      stage: "collect",
      status: "in_progress",
      productionDate: null,
      totalBiomassKg: 8000,
      totalBiocharKg: null,
      estimatedCo2e: null,
      permanenceDiscount: null,
      netCo2e: null,
      assignedTo: "Pilot Team",
      createdAt: daysAgo(4),
      updatedAt: daysAgo(0),
    },
  ],
  feedstock: [
    {
      id: 1,
      batchId: 1,
      biomassSource: "Local mills",
      biomassType: "Rice husk",
      quantityKg: 42000,
      moisturePercent: 12.5,
      supplier: "Faisalabad Co-op",
      collectionDate: daysAgo(45),
      notes: "Cleaned and screened",
      createdAt: daysAgo(44),
    },
    {
      id: 2,
      batchId: 5,
      biomassSource: "Farm aggregates",
      biomassType: "Wheat straw",
      quantityKg: 8000,
      moisturePercent: 14.0,
      supplier: "KP Collectors",
      collectionDate: daysAgo(3),
      notes: null,
      createdAt: daysAgo(3),
    },
  ],
  production: [
    {
      id: 1,
      batchId: 1,
      pyrolysisTemp: 550,
      residenceTimeMin: 45,
      feedrateKgH: 320,
      outputBiocharKg: 12600,
      processingDate: daysAgo(42),
      operatorNotes: "Stable run",
      equipmentId: "KILN-A1",
      createdAt: daysAgo(42),
    },
    {
      id: 2,
      batchId: 2,
      pyrolysisTemp: 520,
      residenceTimeMin: 50,
      feedrateKgH: 280,
      outputBiocharKg: 11000,
      processingDate: daysAgo(22),
      operatorNotes: null,
      equipmentId: "KILN-B2",
      createdAt: daysAgo(22),
    },
  ],
  modelRuns: [
    {
      id: 1,
      batchId: 1,
      registry: "puro_earth",
      biomassCarbonFraction: 0.45,
      pyrolysisRetentionFactor: 0.72,
      grossCo2e: 210.4,
      permanenceDiscount: 0.12,
      netCo2e: 183.5,
      estimatedCreditValue: 42.5,
      eligibility: "eligible",
      eligibilityNotes: null,
      creditPrice: 145,
      createdAt: daysAgo(20),
    },
    {
      id: 2,
      batchId: 4,
      registry: "verra",
      biomassCarbonFraction: 0.43,
      pyrolysisRetentionFactor: 0.7,
      grossCo2e: 245.0,
      permanenceDiscount: 0.1,
      netCo2e: 220.5,
      estimatedCreditValue: 38.0,
      eligibility: "conditional",
      eligibilityNotes: "Awaiting lab H:C ratio",
      creditPrice: 120,
      createdAt: daysAgo(5),
    },
  ],
  issues: [
    {
      id: 1,
      batchId: 3,
      siteId: 1,
      issueType: "missing_data",
      severity: "critical",
      status: "open",
      title: "Missing moisture lab certificate",
      description: "Feedstock moisture certificate not uploaded.",
      assignedTo: "QA Desk",
      autoSubstituted: false,
      substituteValue: null,
      resolvedAt: null,
      resolvedBy: null,
      resolution: null,
      createdAt: daysAgo(3),
    },
    {
      id: 2,
      batchId: 2,
      siteId: 2,
      issueType: "out_of_spec",
      severity: "medium",
      status: "in_review",
      title: "Temperature excursion during residence",
      description: "Brief dip below 500°C for 8 minutes.",
      assignedTo: "S. Malik",
      autoSubstituted: false,
      substituteValue: null,
      resolvedAt: null,
      resolvedBy: null,
      resolution: null,
      createdAt: daysAgo(6),
    },
  ],
  auditEvents: [
    {
      id: 1,
      batchId: 1,
      siteId: 1,
      entityType: "batch",
      entityId: 1,
      action: "stage_advanced",
      actor: "system",
      description: "Advanced to report stage",
      metadata: null,
      createdAt: daysAgo(2),
    },
    {
      id: 2,
      batchId: 3,
      siteId: 1,
      entityType: "assurance_issue",
      entityId: 1,
      action: "issue_opened",
      actor: "A. Khan",
      description: "Flagged missing lab certificate",
      metadata: null,
      createdAt: daysAgo(3),
    },
  ],
  deadlines: [
    {
      id: 1,
      siteId: 1,
      batchId: 1,
      registry: "puro_earth",
      deadlineType: "submission",
      title: "Puro quarterly submission",
      dueDate: daysAgo(-12),
      status: "upcoming",
      assignedTo: "Compliance",
      reminderDays: 7,
      conflictsWith: null,
      notes: null,
      createdAt: daysAgo(20),
    },
    {
      id: 2,
      siteId: 2,
      batchId: 2,
      registry: "verra",
      deadlineType: "attestation",
      title: "Verra monitoring attestation",
      dueDate: daysAgo(2),
      status: "overdue",
      assignedTo: "S. Malik",
      reminderDays: 5,
      conflictsWith: null,
      notes: "Waiting on lab package",
      createdAt: daysAgo(30),
    },
  ],
  allocations: [
    {
      id: 1,
      batchId: 1,
      modelRunId: 1,
      registry: "puro_earth",
      netCo2e: 183.5,
      creditValue: 42.5,
      revenueUsd: 26607.5,
      status: "issued",
      registryRefId: "PURO-BC-001",
      exportedAt: daysAgo(1),
      createdAt: daysAgo(5),
    },
    {
      id: 2,
      batchId: 2,
      modelRunId: 1,
      registry: "verra",
      netCo2e: 160.9,
      creditValue: 38.0,
      revenueUsd: 6114.2,
      status: "pending",
      registryRefId: null,
      exportedAt: null,
      createdAt: daysAgo(4),
    },
  ],
  notifications: [
    {
      id: 1,
      type: "issue_flagged",
      title: "Critical issue on BC-2025-002",
      body: "Missing moisture lab certificate",
      batchId: 3,
      siteId: 1,
      read: false,
      createdAt: daysAgo(1),
    },
    {
      id: 2,
      type: "deadline_approaching",
      title: "Puro submission due soon",
      body: "Due in 12 days",
      batchId: 1,
      siteId: 1,
      read: false,
      createdAt: daysAgo(2),
    },
    {
      id: 3,
      type: "batch_advanced",
      title: "NS-2025-001 moved to Verify",
      body: null,
      batchId: 2,
      siteId: 2,
      read: true,
      createdAt: daysAgo(3),
    },
  ],
};

const stageOrder = [
  "collect",
  "quantify",
  "assurance",
  "verify",
  "comply",
  "report",
] as const;

function jsonResponse(data: Json, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function parsePath(url: string): { pathname: string; search: URLSearchParams } {
  const u = new URL(url, "http://local.mock");
  return { pathname: u.pathname, search: u.searchParams };
}

function dashboardSummary() {
  const openIssues = store.issues.filter(
    (i) => i.status === "open" || i.status === "in_review",
  ).length;
  const criticalIssues = store.issues.filter(
    (i) =>
      i.severity === "critical" &&
      (i.status === "open" || i.status === "in_review"),
  ).length;
  const totalNetCo2e = store.allocations.reduce((s, a) => s + a.netCo2e, 0);
  const totalRevenueUsd = store.allocations.reduce(
    (s, a) => s + (a.revenueUsd ?? 0),
    0,
  );

  return {
    totalSites: store.sites.length,
    totalBatches: store.batches.length,
    activeBatches: store.batches.filter(
      (b) => b.status === "in_progress" || b.status === "blocked",
    ).length,
    totalNetCo2e,
    totalRevenueUsd,
    openIssues,
    criticalIssues,
    upcomingDeadlines: store.deadlines.filter((d) => d.status === "upcoming")
      .length,
    overdueDeadlines: store.deadlines.filter((d) => d.status === "overdue")
      .length,
    issuedCredits: store.allocations
      .filter((a) => a.status === "issued")
      .reduce((s, a) => s + a.netCo2e, 0),
    pendingCredits: store.allocations
      .filter((a) => a.status === "pending")
      .reduce((s, a) => s + a.netCo2e, 0),
    siteBreakdown: store.sites.map((site) => {
      const siteBatches = store.batches.filter((b) => b.siteId === site.id);
      const siteAllocs = store.allocations.filter((a) =>
        siteBatches.some((b) => b.id === a.batchId),
      );
      return {
        siteId: site.id,
        siteName: site.name,
        batchCount: siteBatches.length,
        netCo2e: siteAllocs.reduce((s, a) => s + a.netCo2e, 0),
        revenueUsd: siteAllocs.reduce((s, a) => s + (a.revenueUsd ?? 0), 0),
        openIssues: store.issues.filter(
          (i) =>
            i.siteId === site.id &&
            (i.status === "open" || i.status === "in_review"),
        ).length,
        complianceScore: 92,
      };
    }),
  };
}

async function handleMockRequest(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response | null> {
  const method = (init?.method || "GET").toUpperCase();
  const rawUrl =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url;

  if (!rawUrl.includes("/api/") && !rawUrl.startsWith("/api")) {
    return null;
  }

  const { pathname } = parsePath(rawUrl);

  if (pathname === "/api/healthz") {
    return jsonResponse({ status: "ok" });
  }

  if (pathname === "/api/dashboard/summary" && method === "GET") {
    return jsonResponse(dashboardSummary());
  }

  if (pathname === "/api/dashboard/pipeline" && method === "GET") {
    const counts = {
      collect: 0,
      quantify: 0,
      assurance: 0,
      verify: 0,
      comply: 0,
      report: 0,
    };
    for (const b of store.batches) {
      if (b.stage in counts) {
        counts[b.stage as keyof typeof counts]++;
      }
    }
    return jsonResponse(counts);
  }

  if (pathname === "/api/dashboard/activity" && method === "GET") {
    return jsonResponse(
      store.auditEvents.slice(0, 5).map((e) => ({
        id: e.id,
        type: e.action,
        description: e.description ?? e.action,
        actor: e.actor,
        batchId: e.batchId,
        batchCode: store.batches.find((b) => b.id === e.batchId)?.batchCode,
        siteId: e.siteId,
        siteName: store.sites.find((s) => s.id === e.siteId)?.name,
        timestamp: e.createdAt,
      })),
    );
  }

  if (pathname === "/api/dashboard/registry-comparison" && method === "GET") {
    return jsonResponse({
      topRecommendation: "puro_earth",
      registries: [
        {
          registry: "puro_earth",
          eligibleBatches: 2,
          totalCo2e: 183.5,
          totalRevenue: 26607.5,
          avgCreditPrice: 145,
        },
        {
          registry: "verra",
          eligibleBatches: 2,
          totalCo2e: 160.9,
          totalRevenue: 6114.2,
          avgCreditPrice: 120,
        },
        {
          registry: "ebc",
          eligibleBatches: 1,
          totalCo2e: 0,
          totalRevenue: 0,
          avgCreditPrice: 0,
        },
      ],
    });
  }

  if (pathname === "/api/dashboard/compliance-health" && method === "GET") {
    return jsonResponse({
      overallScore: 86,
      upcomingCount: store.deadlines.filter((d) => d.status === "upcoming")
        .length,
      overdueCount: store.deadlines.filter((d) => d.status === "overdue")
        .length,
      conflictCount: 0,
      deadlines: store.deadlines,
    });
  }

  if (pathname === "/api/sites" && method === "GET") {
    return jsonResponse(store.sites);
  }

  if (pathname === "/api/batches" && method === "GET") {
    return jsonResponse(store.batches);
  }

  const batchMatch = pathname.match(/^\/api\/batches\/(\d+)$/);
  if (batchMatch && method === "GET") {
    const batch = store.batches.find((b) => b.id === Number(batchMatch[1]));
    return batch ? jsonResponse(batch) : jsonResponse({ message: "Not found" }, 404);
  }

  const advanceMatch = pathname.match(/^\/api\/batches\/(\d+)\/advance-stage$/);
  if (advanceMatch && method === "POST") {
    const batch = store.batches.find((b) => b.id === Number(advanceMatch[1]));
    if (!batch) return jsonResponse({ message: "Not found" }, 404);
    const idx = stageOrder.indexOf(batch.stage as (typeof stageOrder)[number]);
    if (idx >= 0 && idx < stageOrder.length - 1) {
      batch.stage = stageOrder[idx + 1];
      batch.updatedAt = now;
      if (batch.stage === "report") batch.status = "completed";
    }
    return jsonResponse(batch);
  }

  if (pathname === "/api/feedstock-entries" && method === "GET") {
    return jsonResponse(store.feedstock);
  }
  if (pathname === "/api/production-records" && method === "GET") {
    return jsonResponse(store.production);
  }
  if (pathname === "/api/model-runs" && method === "GET") {
    return jsonResponse(store.modelRuns);
  }
  if (pathname === "/api/assurance-issues" && method === "GET") {
    return jsonResponse(store.issues);
  }

  const resolveMatch = pathname.match(/^\/api\/assurance-issues\/(\d+)\/resolve$/);
  if (resolveMatch && (method === "POST" || method === "PATCH")) {
    const issue = store.issues.find((i) => i.id === Number(resolveMatch[1]));
    if (!issue) return jsonResponse({ message: "Not found" }, 404);
    issue.status = "resolved";
    issue.resolvedAt = now;
    issue.resolvedBy = "Officer";
    issue.resolution = "Resolved in mock mode";
    return jsonResponse(issue);
  }

  if (pathname === "/api/audit-events" && method === "GET") {
    return jsonResponse(store.auditEvents);
  }
  if (pathname === "/api/compliance-deadlines" && method === "GET") {
    return jsonResponse(store.deadlines);
  }
  if (pathname.startsWith("/api/credit-allocations") && method === "GET") {
    return jsonResponse(store.allocations);
  }
  // some generated clients may use /allocations
  if (pathname === "/api/allocations" && method === "GET") {
    return jsonResponse(store.allocations);
  }

  if (pathname === "/api/notifications" && method === "GET") {
    return jsonResponse(store.notifications);
  }

  const notifRead = pathname.match(/^\/api\/notifications\/(\d+)\/read$/);
  if (notifRead && method === "POST") {
    const n = store.notifications.find((x) => x.id === Number(notifRead[1]));
    if (n) n.read = true;
    return jsonResponse(n ?? { ok: true });
  }

  if (pathname === "/api/notifications/read-all" && method === "POST") {
    store.notifications.forEach((n) => {
      n.read = true;
    });
    return jsonResponse({ ok: true });
  }

  // Unknown API route — still mock a friendly empty result for GETs
  if (method === "GET") {
    return jsonResponse([]);
  }

  return jsonResponse({ ok: true, mock: true });
}

let installed = false;

export function installMockApi() {
  if (installed) return;
  installed = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const mocked = await handleMockRequest(input, init);
    if (mocked) {
      // tiny delay so loading skeletons feel natural
      await new Promise((r) => setTimeout(r, 120));
      return mocked;
    }
    return originalFetch(input, init);
  };

  console.info("[mock-api] Frontend mock database enabled — Express API archived");
}

export function isMockApiEnabled() {
  return import.meta.env.VITE_USE_MOCK_API !== "false";
}
