/**
 * MetalController — HTTP handlers for metal master data.
 */

import type { Request, Response } from "express";
import { asyncRoute } from "../utils/http.js";
import { ok, created, noContent, paginated, buildPagination } from "../utils/response.js";
import { pageArgs } from "../utils/http.js";
import * as metalService from "../services/metal.service.js";
import {
  createMetalSchema,
  updateMetalSchema,
  createRawMaterialSchema,
  updateRawMaterialSchema,
  createSupplierSchema,
  updateSupplierSchema,
  createPriceSchema,
  priceBaseSchema,
  createAlloySchema,
  updateAlloySchema,
  metalQuerySchema
} from "../validations/index.js";

// ── Metals ────────────────────────────────────────────────────────────────────

export const listMetals = asyncRoute(async (req: Request, res: Response) => {
  const query = metalQuerySchema.parse(req.query);
  const result = await metalService.listMetals(query);
  paginated(res, result.data, buildPagination(result.page, result.limit, result.total));
});

export const createMetal = asyncRoute(async (req: Request, res: Response) => {
  const data = createMetalSchema.parse(req.body);
  const row = await metalService.createMetal(data, req.actor!.id, req.ip);
  created(res, row);
});

export const updateMetal = asyncRoute(async (req: Request, res: Response) => {
  const data = updateMetalSchema.parse(req.body);
  const row = await metalService.updateMetal(String(req.params.id), data, req.actor!.id, req.ip);
  ok(res, row);
});

export const deactivateMetal = asyncRoute(async (req: Request, res: Response) => {
  await metalService.deactivateMetal(String(req.params.id), req.actor!.id, req.ip);
  noContent(res);
});

// ── Raw Materials ─────────────────────────────────────────────────────────────

export const listRawMaterials = asyncRoute(async (req: Request, res: Response) => {
  const { page, limit } = pageArgs(req.query);
  const result = await metalService.listRawMaterials(page, limit);
  paginated(res, result.data, buildPagination(result.page, result.limit, result.total));
});

export const createRawMaterial = asyncRoute(async (req: Request, res: Response) => {
  const data = createRawMaterialSchema.parse(req.body);
  const row = await metalService.createRawMaterial(data, req.actor!.id, req.ip);
  created(res, row);
});

export const updateRawMaterial = asyncRoute(async (req: Request, res: Response) => {
  const data = updateRawMaterialSchema.parse(req.body);
  const row = await metalService.updateRawMaterial(String(req.params.id), data, req.actor!.id, req.ip);
  ok(res, row);
});

export const deactivateRawMaterial = asyncRoute(async (req: Request, res: Response) => {
  await metalService.deactivateRawMaterial(String(req.params.id), req.actor!.id, req.ip);
  noContent(res);
});

// ── Suppliers ─────────────────────────────────────────────────────────────────

export const listSuppliers = asyncRoute(async (req: Request, res: Response) => {
  const { page, limit } = pageArgs(req.query);
  const result = await metalService.listSuppliers(page, limit);
  paginated(res, result.data, buildPagination(result.page, result.limit, result.total));
});

export const createSupplier = asyncRoute(async (req: Request, res: Response) => {
  const data = createSupplierSchema.parse(req.body);
  const row = await metalService.createSupplier(data, req.actor!.id, req.ip);
  created(res, row);
});

export const updateSupplier = asyncRoute(async (req: Request, res: Response) => {
  const data = updateSupplierSchema.parse(req.body);
  const row = await metalService.updateSupplier(String(req.params.id), data, req.actor!.id, req.ip);
  ok(res, row);
});

export const deactivateSupplier = asyncRoute(async (req: Request, res: Response) => {
  await metalService.deactivateSupplier(String(req.params.id), req.actor!.id, req.ip);
  noContent(res);
});

// ── Prices ────────────────────────────────────────────────────────────────────

export const listPrices = asyncRoute(async (req: Request, res: Response) => {
  const { page, limit } = pageArgs(req.query);
  const metalId = req.query.metalId ? String(req.query.metalId) : undefined;
  const rawMaterialId = req.query.rawMaterialId ? String(req.query.rawMaterialId) : undefined;
  const result = await metalService.listPrices(page, limit, metalId, rawMaterialId);
  paginated(res, result.data, buildPagination(result.page, result.limit, result.total));
});

export const createPrice = asyncRoute(async (req: Request, res: Response) => {
  const data = createPriceSchema.parse(req.body);
  const row = await metalService.createPrice(data, req.actor!.id, req.ip);
  created(res, row);
});

export const updatePrice = asyncRoute(async (req: Request, res: Response) => {
  const data = priceBaseSchema.partial().parse(req.body);
  const row = await metalService.updatePrice(String(req.params.id), data, req.actor!.id, req.ip);
  ok(res, row);
});

export const deactivatePrice = asyncRoute(async (req: Request, res: Response) => {
  await metalService.deactivatePrice(String(req.params.id), req.actor!.id, req.ip);
  noContent(res);
});

export const listPriceHistory = asyncRoute(async (req: Request, res: Response) => {
  const { page, limit } = pageArgs(req.query);
  const result = await metalService.listPriceHistory(page, limit);
  paginated(res, result.data, buildPagination(result.page, result.limit, result.total));
});

// ── Alloys ────────────────────────────────────────────────────────────────────

export const listAlloys = asyncRoute(async (req: Request, res: Response) => {
  const { page, limit } = pageArgs(req.query);
  const result = await metalService.listAlloys(page, limit);
  paginated(res, result.data, buildPagination(result.page, result.limit, result.total));
});

export const createAlloy = asyncRoute(async (req: Request, res: Response) => {
  const data = createAlloySchema.parse(req.body);
  const row = await metalService.createAlloy(data, req.actor!.id, req.ip);
  created(res, row);
});

export const updateAlloy = asyncRoute(async (req: Request, res: Response) => {
  const data = updateAlloySchema.parse(req.body);
  const row = await metalService.updateAlloy(String(req.params.id), data as any, req.actor!.id, req.ip);
  ok(res, row);
});

export const deactivateAlloy = asyncRoute(async (req: Request, res: Response) => {
  await metalService.deactivateAlloy(String(req.params.id), req.actor!.id, req.ip);
  noContent(res);
});
