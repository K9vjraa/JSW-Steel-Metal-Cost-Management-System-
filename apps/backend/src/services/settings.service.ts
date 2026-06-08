/**
 * SettingsService — business logic for SystemSetting and GstSlab.
 */

import { ApiError } from "../utils/http.js";
import { audit } from "./audit.js";
import * as settingsRepo from "../repositories/settings.repository.js";
import type {
  UpdateSettingInput,
  BulkUpdateSettingsInput,
  CreateGstSlabInput,
  UpdateGstSlabInput
} from "../validations/index.js";

// ── System Settings ───────────────────────────────────────────────────────────

export async function listSettings(category?: string) {
  return settingsRepo.listSettings(category);
}

export async function getSetting(key: string) {
  const setting = await settingsRepo.findSettingByKey(key);
  if (!setting) throw new ApiError(404, "Setting not found.");
  return setting;
}

export async function updateSetting(
  key: string,
  input: UpdateSettingInput,
  actorId: string,
  ip?: string
) {
  const row = await settingsRepo.updateSetting(key, input, actorId);
  await audit({
    userId: actorId,
    action: "UPDATE",
    entity: "SystemSetting",
    entityId: row.id,
    details: { key: row.key, value: row.value },
    ipAddress: ip
  });
  return row;
}

export async function bulkUpdateSettings(
  input: BulkUpdateSettingsInput,
  actorId: string,
  ip?: string
) {
  await settingsRepo.bulkUpdateSettings(Object.entries(input), actorId);
  for (const [key, value] of Object.entries(input)) {
    await audit({
      userId: actorId,
      action: "UPDATE",
      entity: "SystemSetting",
      entityId: key,
      details: { key, value },
      ipAddress: ip
    });
  }
  return { success: true };
}

// ── GST Slabs ─────────────────────────────────────────────────────────────────

export async function listGstSlabs() {
  return settingsRepo.listGstSlabs();
}

export async function createGstSlab(input: CreateGstSlabInput, actorId: string, ip?: string) {
  const row = await settingsRepo.createGstSlab(input);
  await audit({
    userId: actorId,
    action: "CREATE",
    entity: "GstSlab",
    entityId: row.id,
    details: { code: row.code, rate: row.rate.toString() },
    ipAddress: ip
  });
  return row;
}

export async function updateGstSlab(id: string, input: UpdateGstSlabInput, actorId: string, ip?: string) {
  const row = await settingsRepo.updateGstSlab(id, input);
  await audit({
    userId: actorId,
    action: "UPDATE",
    entity: "GstSlab",
    entityId: row.id,
    details: { code: row.code, rate: row.rate.toString() },
    ipAddress: ip
  });
  return row;
}

export async function deactivateGstSlab(id: string, actorId: string, ip?: string) {
  await settingsRepo.deactivateGstSlab(id);
  await audit({
    userId: actorId,
    action: "DEACTIVATE",
    entity: "GstSlab",
    entityId: id,
    details: {},
    ipAddress: ip
  });
}
