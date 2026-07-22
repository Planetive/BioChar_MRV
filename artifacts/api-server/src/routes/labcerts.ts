import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, labCertificatesTable } from "@workspace/db";
import {
  ListLabCertificatesResponse,
  ListLabCertificatesQueryParams,
  CreateLabCertificateBody,
  CreateLabCertificateResponse,
  UpdateLabCertificateParams,
  UpdateLabCertificateBody,
  UpdateLabCertificateResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/lab-certificates", async (req, res): Promise<void> => {
  const qp = ListLabCertificatesQueryParams.safeParse(req.query);
  const conditions = [];
  if (qp.success) {
    if (qp.data.batchId != null) conditions.push(eq(labCertificatesTable.batchId, qp.data.batchId));
  }
  const certs = conditions.length
    ? await db.select().from(labCertificatesTable).where(and(...conditions)).orderBy(labCertificatesTable.createdAt)
    : await db.select().from(labCertificatesTable).orderBy(labCertificatesTable.createdAt);
  res.json(ListLabCertificatesResponse.parse(certs));
});

router.post("/lab-certificates", async (req, res): Promise<void> => {
  const parsed = CreateLabCertificateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [cert] = await db.insert(labCertificatesTable).values(parsed.data as any).returning();
  res.status(201).json(CreateLabCertificateResponse.parse(cert));
});

router.patch("/lab-certificates/:id", async (req, res): Promise<void> => {
  const params = UpdateLabCertificateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateLabCertificateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [cert] = await db.update(labCertificatesTable).set(parsed.data as any).where(eq(labCertificatesTable.id, params.data.id)).returning();
  if (!cert) {
    res.status(404).json({ error: "Lab certificate not found" });
    return;
  }
  res.json(UpdateLabCertificateResponse.parse(cert));
});

export default router;
