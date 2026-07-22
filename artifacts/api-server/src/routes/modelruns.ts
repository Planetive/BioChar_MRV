import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, modelRunsTable, labCertificatesTable, feedstockEntriesTable, batchesTable } from "@workspace/db";
import {
  ListModelRunsResponse,
  ListModelRunsQueryParams,
  CreateModelRunBody,
  CreateModelRunResponse,
  GetModelRunParams,
  GetModelRunResponse,
} from "@workspace/api-zod";

// Permanence discount by H:Corg ratio — CORC200+ logic
function calcPermanenceDiscount(hCorgRatio: number): number {
  if (hCorgRatio <= 0.4) return 0.02;
  if (hCorgRatio <= 0.6) return 0.05;
  if (hCorgRatio <= 0.7) return 0.10;
  return 0.20;
}

// Registry-specific eligibility rules (simplified)
function calcEligibility(registry: string, hCorgRatio: number, organicCarbonPercent: number): string {
  if (registry === "puro_earth") {
    return hCorgRatio <= 0.7 && organicCarbonPercent >= 50 ? "eligible" : "conditional";
  }
  if (registry === "verra") {
    return organicCarbonPercent >= 45 ? "eligible" : "ineligible";
  }
  if (registry === "ebc") {
    return hCorgRatio <= 0.7 && organicCarbonPercent >= 50 ? "eligible" : "conditional";
  }
  return "conditional";
}

const CREDIT_PRICES: Record<string, number> = { puro_earth: 120, verra: 85, ebc: 105 };

const router: IRouter = Router();

router.get("/model-runs", async (req, res): Promise<void> => {
  const qp = ListModelRunsQueryParams.safeParse(req.query);
  const conditions = [];
  if (qp.success && qp.data.batchId != null) {
    conditions.push(eq(modelRunsTable.batchId, qp.data.batchId));
  }
  const runs = conditions.length
    ? await db.select().from(modelRunsTable).where(and(...conditions)).orderBy(modelRunsTable.createdAt)
    : await db.select().from(modelRunsTable).orderBy(modelRunsTable.createdAt);
  res.json(ListModelRunsResponse.parse(runs));
});

router.post("/model-runs", async (req, res): Promise<void> => {
  const parsed = CreateModelRunBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // Gather data for calculation
  const [batch] = await db.select().from(batchesTable).where(eq(batchesTable.id, parsed.data.batchId));
  if (!batch) {
    res.status(404).json({ error: "Batch not found" });
    return;
  }

  const feedstocks = await db.select().from(feedstockEntriesTable).where(eq(feedstockEntriesTable.batchId, parsed.data.batchId));
  const labCerts = await db.select().from(labCertificatesTable).where(eq(labCertificatesTable.batchId, parsed.data.batchId));

  const totalBiomassKg = feedstocks.reduce((sum, f) => sum + (f.quantityKg ?? 0), 0);
  const avgHCorg = labCerts.length > 0 ? labCerts.reduce((s, l) => s + l.hCorgRatio, 0) / labCerts.length : 0.5;
  const avgOrgCarbon = labCerts.length > 0 ? labCerts.reduce((s, l) => s + l.organicCarbonPercent, 0) / labCerts.length : 55;

  const biomassCarbonFraction = avgOrgCarbon / 100;
  const pyrolysisRetentionFactor = parsed.data.registry === "puro_earth" ? 0.85 : parsed.data.registry === "ebc" ? 0.82 : 0.80;
  const grossCo2e = totalBiomassKg > 0 ? totalBiomassKg * biomassCarbonFraction * pyrolysisRetentionFactor * (44 / 12) : (batch.estimatedCo2e ?? 50);
  const permanenceDiscount = calcPermanenceDiscount(avgHCorg);
  const netCo2e = grossCo2e * (1 - permanenceDiscount);
  const creditPrice = parsed.data.creditPrice ?? CREDIT_PRICES[parsed.data.registry] ?? 100;
  const estimatedCreditValue = netCo2e * creditPrice;
  const eligibility = calcEligibility(parsed.data.registry, avgHCorg, avgOrgCarbon);

  const [run] = await db.insert(modelRunsTable).values({
    batchId: parsed.data.batchId,
    registry: parsed.data.registry,
    biomassCarbonFraction,
    pyrolysisRetentionFactor,
    grossCo2e,
    permanenceDiscount,
    netCo2e,
    estimatedCreditValue,
    eligibility,
    creditPrice,
    eligibilityNotes: eligibility === "conditional" ? "Review H:Corg ratio and organic carbon thresholds against registry requirements" : null,
  }).returning();

  res.status(201).json(CreateModelRunResponse.parse(run));
});

router.get("/model-runs/:id", async (req, res): Promise<void> => {
  const params = GetModelRunParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [run] = await db.select().from(modelRunsTable).where(eq(modelRunsTable.id, params.data.id));
  if (!run) {
    res.status(404).json({ error: "Model run not found" });
    return;
  }
  res.json(GetModelRunResponse.parse(run));
});

export default router;
