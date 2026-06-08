/**
 * NotificationRepository — Prisma data-access for Notification model.
 */

import { prisma, paginate } from "./base.repository.js";
import type { CreateNotificationDto } from "../types/dto.js";

export async function createNotification(data: CreateNotificationDto) {
  return prisma.notification.create({ data: data as any });
}

export async function listNotifications(userId: string, page: number, limit: number) {
  const skip = (page - 1) * limit;
  const where = { OR: [{ userId }, { userId: null }] };
  const [total, data] = await paginate(
    prisma.notification.count({ where }),
    prisma.notification.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: limit })
  );
  return { data, total, page, limit };
}

export async function markNotificationRead(id: string) {
  return prisma.notification.update({ where: { id }, data: { readAt: new Date() } });
}

export async function countUnread(userId: string) {
  return prisma.notification.count({
    where: { OR: [{ userId }, { userId: null }], readAt: null }
  });
}
