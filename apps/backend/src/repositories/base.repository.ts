/**
 * Base repository — shared pagination + sort utilities for all repositories.
 */

import { prisma } from "../prisma/client.js";
import { pageArgs } from "../utils/http.js";
import type { Request } from "express";

export { prisma };

/** Standard page/limit extracted from request query. */
export function paginationFrom(query: Request["query"]) {
  return pageArgs(query);
}

/** Build a standard pagination meta object. */
export function buildMeta(page: number, limit: number, total: number) {
  return { page, limit, total, pages: Math.ceil(total / limit) };
}

/**
 * Run count + findMany in parallel.
 * Uses `Promise.all` (parallel execution) instead of `prisma.$transaction`
 * to avoid the PrismaPromise overload mismatch — read-only lists don't need
 * transaction semantics.
 * Returns `[total, rows]`.
 */
export async function paginate<T>(
  countQuery: Promise<number>,
  dataQuery: Promise<T[]>
): Promise<[number, T[]]> {
  return Promise.all([countQuery, dataQuery]);
}
