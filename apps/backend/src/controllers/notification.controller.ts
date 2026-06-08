/**
 * NotificationController — HTTP handlers for notifications and SSE stream.
 */

import type { Request, Response } from "express";
import { asyncRoute } from "../utils/http.js";
import { ok, paginated, buildPagination } from "../utils/response.js";
import { pageArgs } from "../utils/http.js";
import * as notifService from "../services/notification.service.js";

export const listNotifications = asyncRoute(async (req: Request, res: Response) => {
  const { page, limit } = pageArgs(req.query);
  const result = await notifService.listNotifications(req.actor!.id, page, limit);
  paginated(res, result.data, buildPagination(result.page, result.limit, result.total));
});

export const markRead = asyncRoute(async (req: Request, res: Response) => {
  const row = await notifService.markRead(String(req.params.id));
  ok(res, row);
});

/** SSE live stream endpoint — one persistent connection per authenticated user. */
export const liveStream = asyncRoute(async (req: Request, res: Response) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive"
  });
  res.write(`event: ready\ndata: ${JSON.stringify({ userId: req.actor!.id })}\n\n`);

  const onNotification = (notification: unknown) => {
    const n = notification as { userId?: string | null };
    if (!n.userId || n.userId === req.actor!.id) {
      res.write(`event: notification\ndata: ${JSON.stringify(notification)}\n\n`);
    }
  };

  notifService.notificationBus.on("notification", onNotification);
  const heartbeat = setInterval(() => res.write(": keep-alive\n\n"), 20_000);

  req.on("close", () => {
    clearInterval(heartbeat);
    notifService.notificationBus.off("notification", onNotification);
  });
});
