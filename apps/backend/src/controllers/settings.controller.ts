/**
 * SettingsController — HTTP handlers for system settings and GST slabs.
 */

import type { Request, Response } from "express";
import { asyncRoute } from "../utils/http.js";
import { ok, created, noContent } from "../utils/response.js";
import * as settingsService from "../services/settings.service.js";
import {
  updateSettingSchema,
  bulkUpdateSettingsSchema,
  createGstSlabSchema,
  updateGstSlabSchema
} from "../validations/index.js";

// ── System Settings ───────────────────────────────────────────────────────────

export const listSettings = asyncRoute(async (req: Request, res: Response) => {
  const category = req.query.category ? String(req.query.category) : undefined;
  const data = await settingsService.listSettings(category);
  ok(res, data);
});

export const getSetting = asyncRoute(async (req: Request, res: Response) => {
  const data = await settingsService.getSetting(String(req.params.key));
  ok(res, data);
});

export const updateSetting = asyncRoute(async (req: Request, res: Response) => {
  const input = updateSettingSchema.parse(req.body);
  const row = await settingsService.updateSetting(String(req.params.key), input, req.actor!.id, req.ip);
  ok(res, row);
});

export const bulkUpdateSettings = asyncRoute(async (req: Request, res: Response) => {
  const input = bulkUpdateSettingsSchema.parse(req.body);
  const result = await settingsService.bulkUpdateSettings(input, req.actor!.id, req.ip);
  ok(res, result);
});

// ── GST Slabs ─────────────────────────────────────────────────────────────────

export const listGstSlabs = asyncRoute(async (_req: Request, res: Response) => {
  const data = await settingsService.listGstSlabs();
  ok(res, data);
});

export const createGstSlab = asyncRoute(async (req: Request, res: Response) => {
  const input = createGstSlabSchema.parse(req.body);
  const row = await settingsService.createGstSlab(input, req.actor!.id, req.ip);
  created(res, row);
});

export const updateGstSlab = asyncRoute(async (req: Request, res: Response) => {
  const input = updateGstSlabSchema.parse(req.body);
  const row = await settingsService.updateGstSlab(String(req.params.id), input, req.actor!.id, req.ip);
  ok(res, row);
});

export const deactivateGstSlab = asyncRoute(async (req: Request, res: Response) => {
  await settingsService.deactivateGstSlab(String(req.params.id), req.actor!.id, req.ip);
  noContent(res);
});
