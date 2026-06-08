/**
 * MetalService — business logic for Metal, Grade, RawMaterial, Supplier,
 * Price and Alloy operations.
 */

import { ApiError } from "../utils/http.js";
import { audit } from "./audit.js";
import { notify } from "./notifications.js";
import * as metalRepo from "../repositories/metal.repository.js";
import * as gradeRepo from "../repositories/grade.repository.js";
import type {
  CreateMetalInput,
  UpdateMetalInput,
  CreateGradeInput,
  UpdateGradeInput,
  GradeQueryInput,
  CreateAlloyInput,
  MetalQueryInput
} from "../validations/index.js";

// ── Metals ────────────────────────────────────────────────────────────────────

export async function listMetals(query: MetalQueryInput) {
  return metalRepo.listMetals(query);
}

export async function createMetal(data: CreateMetalInput, actorId: string, ip?: string) {
  const row = await metalRepo.createMetal(data);
  await audit({ userId: actorId, action: "CREATE", entity: "Metal", entityId: row.id, details: { code: row.code }, ipAddress: ip });
  return row;
}

export async function updateMetal(id: string, data: UpdateMetalInput, actorId: string, ip?: string) {
  const row = await metalRepo.updateMetal(id, data);
  await audit({ userId: actorId, action: "UPDATE", entity: "Metal", entityId: row.id, details: { code: row.code }, ipAddress: ip });
  return row;
}

export async function deactivateMetal(id: string, actorId: string, ip?: string) {
  await metalRepo.deactivateMetal(id);
  await audit({ userId: actorId, action: "DEACTIVATE", entity: "Metal", entityId: id, details: {}, ipAddress: ip });
}

// ── Grades ────────────────────────────────────────────────────────────────────

export async function listGrades(query: GradeQueryInput) {
  return gradeRepo.listGrades(query);
}

export async function createGrade(data: CreateGradeInput, actorId: string, ip?: string) {
  const row = await gradeRepo.createGrade(data);
  await audit({ userId: actorId, action: "CREATE", entity: "Grade", entityId: row.id, details: { name: row.name }, ipAddress: ip });
  return row;
}

export async function updateGrade(id: string, data: UpdateGradeInput, actorId: string, ip?: string) {
  const row = await gradeRepo.updateGrade(id, data);
  await audit({ userId: actorId, action: "UPDATE", entity: "Grade", entityId: row.id, details: { name: row.name }, ipAddress: ip });
  return row;
}

export async function deactivateGrade(id: string, actorId: string, ip?: string) {
  await gradeRepo.deactivateGrade(id);
  await audit({ userId: actorId, action: "DEACTIVATE", entity: "Grade", entityId: id, details: {}, ipAddress: ip });
}

// ── Raw Materials ─────────────────────────────────────────────────────────────

export async function listRawMaterials(page: number, limit: number) {
  return metalRepo.listRawMaterials(page, limit);
}

export async function createRawMaterial(data: object, actorId: string, ip?: string) {
  const row = await metalRepo.createRawMaterial(data);
  await audit({ userId: actorId, action: "CREATE", entity: "RawMaterial", entityId: (row as any).id, details: { code: (row as any).code }, ipAddress: ip });
  return row;
}

export async function updateRawMaterial(id: string, data: object, actorId: string, ip?: string) {
  const row = await metalRepo.updateRawMaterial(id, data);
  await audit({ userId: actorId, action: "UPDATE", entity: "RawMaterial", entityId: (row as any).id, details: { code: (row as any).code }, ipAddress: ip });
  return row;
}

export async function deactivateRawMaterial(id: string, actorId: string, ip?: string) {
  await metalRepo.deactivateRawMaterial(id);
  await audit({ userId: actorId, action: "DEACTIVATE", entity: "RawMaterial", entityId: id, details: {}, ipAddress: ip });
}

// ── Suppliers ─────────────────────────────────────────────────────────────────

export async function listSuppliers(page: number, limit: number) {
  return metalRepo.listSuppliers(page, limit);
}

export async function createSupplier(data: object, actorId: string, ip?: string) {
  const row = await metalRepo.createSupplier(data);
  await audit({ userId: actorId, action: "CREATE", entity: "Supplier", entityId: (row as any).id, details: { code: (row as any).code }, ipAddress: ip });
  return row;
}

export async function updateSupplier(id: string, data: object, actorId: string, ip?: string) {
  const row = await metalRepo.updateSupplier(id, data);
  await audit({ userId: actorId, action: "UPDATE", entity: "Supplier", entityId: (row as any).id, details: { code: (row as any).code }, ipAddress: ip });
  return row;
}

export async function deactivateSupplier(id: string, actorId: string, ip?: string) {
  await metalRepo.deactivateSupplier(id);
  await audit({ userId: actorId, action: "DEACTIVATE", entity: "Supplier", entityId: id, details: {}, ipAddress: ip });
}

// ── Prices ────────────────────────────────────────────────────────────────────

export async function listPrices(page: number, limit: number, metalId?: string, rawMaterialId?: string) {
  return metalRepo.listPrices(page, limit, metalId, rawMaterialId);
}

export async function createPrice(data: any, actorId: string, ip?: string) {
  const current = await metalRepo.findActivePrice(data.metalId, data.rawMaterialId);
  const row = await metalRepo.createPrice({ ...data, effectiveFrom: data.effectiveFrom });
  await metalRepo.createPriceHistory({
    metalId: data.metalId,
    rawMaterialId: data.rawMaterialId,
    oldPrice: current?.pricePerUnit,
    newPrice: data.pricePerUnit,
    reason: data.reason,
    updatedById: actorId
  });
  await audit({ userId: actorId, action: "PRICE_UPDATE", entity: "PriceList", entityId: (row as any).id, details: { previous: current?.pricePerUnit?.toString(), next: data.pricePerUnit }, ipAddress: ip });
  await notify({ title: "Price master updated", message: `${data.source} published a master-locked price.`, category: "PRICE", priority: "HIGH" });
  return row;
}

export async function updatePrice(id: string, data: object, actorId: string, ip?: string) {
  const row = await metalRepo.updatePrice(id, data);
  await audit({ userId: actorId, action: "UPDATE", entity: "PriceList", entityId: id, details: { active: (row as any).active }, ipAddress: ip });
  return row;
}

export async function deactivatePrice(id: string, actorId: string, ip?: string) {
  await metalRepo.deactivatePrice(id);
  await audit({ userId: actorId, action: "DEACTIVATE", entity: "PriceList", entityId: id, details: {}, ipAddress: ip });
}

export async function listPriceHistory(page: number, limit: number) {
  return metalRepo.listPriceHistory(page, limit);
}

// ── Alloys ────────────────────────────────────────────────────────────────────

export async function listAlloys(page: number, limit: number) {
  return metalRepo.listAlloys(page, limit);
}

export async function createAlloy(data: CreateAlloyInput, actorId: string, ip?: string) {
  const row = await metalRepo.createAlloy(data, actorId);
  await audit({ userId: actorId, action: "CREATE", entity: "Alloy", entityId: row.id, details: { code: row.code }, ipAddress: ip });
  return row;
}

export async function updateAlloy(id: string, data: Partial<CreateAlloyInput>, actorId: string, ip?: string) {
  const row = await metalRepo.updateAlloy(id, data);
  await audit({ userId: actorId, action: "UPDATE", entity: "Alloy", entityId: row.id, details: { code: row.code }, ipAddress: ip });
  return row;
}

export async function deactivateAlloy(id: string, actorId: string, ip?: string) {
  await metalRepo.deactivateAlloy(id);
  await audit({ userId: actorId, action: "DEACTIVATE", entity: "Alloy", entityId: id, details: {}, ipAddress: ip });
}
