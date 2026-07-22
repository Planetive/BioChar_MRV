import { Router, type IRouter } from "express";
import healthRouter from "./health";
import sitesRouter from "./sites";
import batchesRouter from "./batches";
import feedstockRouter from "./feedstock";
import productionRouter from "./production";
import labcertsRouter from "./labcerts";
import custodyRouter from "./custody";
import modelrunsRouter from "./modelruns";
import assuranceRouter from "./assurance";
import auditRouter from "./audit";
import complianceRouter from "./compliance";
import allocationsRouter from "./allocations";
import notificationsRouter from "./notifications";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(sitesRouter);
router.use(batchesRouter);
router.use(feedstockRouter);
router.use(productionRouter);
router.use(labcertsRouter);
router.use(custodyRouter);
router.use(modelrunsRouter);
router.use(assuranceRouter);
router.use(auditRouter);
router.use(complianceRouter);
router.use(allocationsRouter);
router.use(notificationsRouter);
router.use(dashboardRouter);

export default router;
