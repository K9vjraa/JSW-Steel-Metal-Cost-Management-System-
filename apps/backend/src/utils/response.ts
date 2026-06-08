/**
 * Standardized API response helpers.
 * Keeps controller code terse and ensures a consistent response envelope.
 */

import type { Response } from "express";

// ── Envelope types ────────────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface SuccessEnvelope<T> {
  success: true;
  data: T;
}

export interface PaginatedEnvelope<T> {
  success: true;
  data: T[];
  pagination: PaginationMeta;
}

export interface ErrorEnvelope {
  success: false;
  message: string;
  issues?: unknown[];
}

// ── Builders ─────────────────────────────────────────────────────────────────

/** 200 / 201 JSON with a standard `{ success, data }` wrapper. */
export function ok<T>(res: Response, data: T, status = 200): void {
  res.status(status).json({ success: true, data } satisfies SuccessEnvelope<T>);
}

/** 201 Created convenience wrapper. */
export function created<T>(res: Response, data: T): void {
  ok(res, data, 201);
}

/** Paginated list response. */
export function paginated<T>(
  res: Response,
  data: T[],
  pagination: PaginationMeta
): void {
  res.json({ success: true, data, pagination } satisfies PaginatedEnvelope<T>);
}

/** 204 No Content. */
export function noContent(res: Response): void {
  res.status(204).send();
}

/** Generic error response (prefer ApiError for typed errors). */
export function error(res: Response, status: number, message: string): void {
  res.status(status).json({ success: false, message } satisfies ErrorEnvelope);
}

// ── Pagination helpers ────────────────────────────────────────────────────────

/** Build pagination meta from raw args. */
export function buildPagination(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  return { page, limit, total, pages: Math.ceil(total / limit) };
}
