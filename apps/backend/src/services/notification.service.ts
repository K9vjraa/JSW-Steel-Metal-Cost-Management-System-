/**
 * NotificationService — upgraded service for notifications with event bus.
 * Replaces the thin `services/notifications.ts` function.
 */

import EventEmitter from "node:events";
import * as notifRepo from "../repositories/notification.repository.js";
import type { CreateNotificationDto } from "../types/dto.js";

/** In-process SSE bus — swap for Redis pub/sub in a multi-instance deployment. */
export const notificationBus = new EventEmitter();
notificationBus.setMaxListeners(200);

export async function createNotification(data: CreateNotificationDto) {
  const notification = await notifRepo.createNotification(data);
  notificationBus.emit("notification", notification);
  return notification;
}

export async function listNotifications(userId: string, page: number, limit: number) {
  return notifRepo.listNotifications(userId, page, limit);
}

export async function markRead(id: string) {
  return notifRepo.markNotificationRead(id);
}

export async function unreadCount(userId: string) {
  return notifRepo.countUnread(userId);
}

/** Convenience alias used throughout services. */
export const notify = createNotification;
