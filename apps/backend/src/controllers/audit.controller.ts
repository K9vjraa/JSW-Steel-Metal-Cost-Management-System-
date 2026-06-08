/**
 * AuditController — HTTP handler for audit log queries.
 * Delegates to the full-featured AuditRepository.
 */

import type { Request, Response } from "express";
import { asyncRoute, pageArgs } from "../utils/http.js";
import { paginated, buildPagination } from "../utils/response.js";
import { listAuditLogs } from "../repositories/audit.repository.js";

export const listLogs = asyncRoute(async (req: Request, res: Response) => {
  const { page, limit } = pageArgs(req.query);
  const q = req.query as Record<string, string | undefined>;
  const result = await listAuditLogs({
    page,
    limit,
    search: q.search,
    action: q.action,
    entity: q.entity,
    userId: q.userId,
    from: q.from,
    to: q.to,
    startDate: q.startDate,
    endDate: q.endDate,
    sortBy: q.sortBy,
    sortDir: q.sortDir as "asc" | "desc" | undefined
  });
  paginated(res, result.data, buildPagination(result.page, result.limit, result.total));
});
