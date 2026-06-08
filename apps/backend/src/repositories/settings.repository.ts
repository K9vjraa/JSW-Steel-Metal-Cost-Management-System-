/**
 * SettingsRepository — Prisma data-access for SystemSetting and GstSlab.
 */

import { prisma } from "./base.repository.js";
import type { UpdateSettingInput, CreateGstSlabInput, UpdateGstSlabInput } from "../validations/index.js";

// ── System Settings ───────────────────────────────────────────────────────────

export async function listSettings(category?: string) {
  return prisma.systemSetting.findMany({
    where: category ? { category } : {},
    orderBy: [{ category: "asc" }, { key: "asc" }]
  });
}

export async function findSettingByKey(key: string) {
  return prisma.systemSetting.findUnique({ where: { key } });
}

export async function updateSetting(key: string, data: UpdateSettingInput, updatedById: string) {
  return prisma.systemSetting.update({
    where: { key },
    data: { ...data, updatedById }
  });
}

export async function bulkUpdateSettings(
  entries: [string, string][],
  updatedById: string
) {
  return prisma.$transaction(
    entries.map(([key, value]) =>
      prisma.systemSetting.update({ where: { key }, data: { value, updatedById } })
    )
  );
}

export async function getSettingsByKeys(keys: string[]) {
  const rows = await prisma.systemSetting.findMany({ where: { key: { in: keys } } });
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

// ── GST Slabs ─────────────────────────────────────────────────────────────────

export async function listGstSlabs() {
  return prisma.gstSlab.findMany({ orderBy: { rate: "asc" } });
}

export async function createGstSlab(data: CreateGstSlabInput) {
  return prisma.gstSlab.create({ data });
}

export async function updateGstSlab(id: string, data: UpdateGstSlabInput) {
  return prisma.gstSlab.update({ where: { id }, data });
}

export async function deactivateGstSlab(id: string) {
  return prisma.gstSlab.update({ where: { id }, data: { active: false } });
}
