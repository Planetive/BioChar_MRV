import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, sitesTable } from "@workspace/db";
import {
  ListSitesResponse,
  CreateSiteBody,
  CreateSiteResponse,
  GetSiteParams,
  GetSiteResponse,
  UpdateSiteParams,
  UpdateSiteBody,
  UpdateSiteResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/sites", async (req, res): Promise<void> => {
  const sites = await db.select().from(sitesTable).orderBy(sitesTable.createdAt);
  res.json(ListSitesResponse.parse(sites));
});

router.post("/sites", async (req, res): Promise<void> => {
  const parsed = CreateSiteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [site] = await db.insert(sitesTable).values(parsed.data).returning();
  res.status(201).json(CreateSiteResponse.parse(site));
});

router.get("/sites/:id", async (req, res): Promise<void> => {
  const params = GetSiteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [site] = await db.select().from(sitesTable).where(eq(sitesTable.id, params.data.id));
  if (!site) {
    res.status(404).json({ error: "Site not found" });
    return;
  }
  res.json(GetSiteResponse.parse(site));
});

router.patch("/sites/:id", async (req, res): Promise<void> => {
  const params = UpdateSiteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateSiteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [site] = await db.update(sitesTable).set(parsed.data).where(eq(sitesTable.id, params.data.id)).returning();
  if (!site) {
    res.status(404).json({ error: "Site not found" });
    return;
  }
  res.json(UpdateSiteResponse.parse(site));
});

export default router;
