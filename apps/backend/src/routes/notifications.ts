/**
 * Notification routes — thin wiring to NotificationController.
 */

import { Router } from "express";
import * as ctrl from "../controllers/notification.controller.js";

export const notificationRoutes = Router();

notificationRoutes.get("/", ctrl.listNotifications);
notificationRoutes.patch("/:id/read", ctrl.markRead);
notificationRoutes.get("/stream/live", ctrl.liveStream);
