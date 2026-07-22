import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, notificationsTable } from "@workspace/db";
import {
  ListNotificationsResponse,
  ListNotificationsQueryParams,
  MarkNotificationReadParams,
  MarkNotificationReadResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/notifications", async (req, res): Promise<void> => {
  const qp = ListNotificationsQueryParams.safeParse(req.query);
  let notifications;
  if (qp.success && qp.data.unreadOnly) {
    notifications = await db.select().from(notificationsTable).where(eq(notificationsTable.read, false)).orderBy(notificationsTable.createdAt);
  } else {
    notifications = await db.select().from(notificationsTable).orderBy(notificationsTable.createdAt);
  }
  res.json(ListNotificationsResponse.parse(notifications));
});

router.post("/notifications/:id/read", async (req, res): Promise<void> => {
  const params = MarkNotificationReadParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [notification] = await db.update(notificationsTable).set({ read: true }).where(eq(notificationsTable.id, params.data.id)).returning();
  if (!notification) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }
  res.json(MarkNotificationReadResponse.parse(notification));
});

router.post("/notifications/read-all", async (_req, res): Promise<void> => {
  await db.update(notificationsTable).set({ read: true });
  res.sendStatus(204);
});

export default router;
