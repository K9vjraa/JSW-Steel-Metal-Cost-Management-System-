/**
 * ReportController — HTTP handlers for reports and analytics.
 */

import type { Request, Response } from "express";
import { asyncRoute } from "../utils/http.js";
import { ok, created, noContent, paginated, buildPagination } from "../utils/response.js";
import * as reportService from "../services/report.service.js";
import {
  createReportSchema,
  reportQuerySchema,
  dateRangeSchema
} from "../validations/index.js";

export const listReports = asyncRoute(async (req: Request, res: Response) => {
  const query = reportQuerySchema.parse(req.query);
  const result = await reportService.listReports(query, req.actor!.id, req.actor!.role);
  paginated(res, result.data, buildPagination(result.page, result.limit, result.total));
});

export const getReport = asyncRoute(async (req: Request, res: Response) => {
  const row = await reportService.getReport(String(req.params.id), req.actor!.id, req.actor!.role);
  ok(res, row);
});

export const createReport = asyncRoute(async (req: Request, res: Response) => {
  const input = createReportSchema.parse(req.body);
  const row = await reportService.createReport(input, req.actor!.id, req.ip);
  created(res, row);
});

export const deleteReport = asyncRoute(async (req: Request, res: Response) => {
  await reportService.deleteReport(
    String(req.params.id),
    req.actor!.id,
    req.actor!.role,
    req.ip
  );
  noContent(res);
});

// ── Analytics ─────────────────────────────────────────────────────────────────

export const costSummary = asyncRoute(async (req: Request, res: Response) => {
  const range = dateRangeSchema.parse(req.query);
  const data = await reportService.getCostSummary(range, req.actor!.id, req.actor!.role);
  ok(res, data);
});

export const trends = asyncRoute(async (req: Request, res: Response) => {
  const range = dateRangeSchema.parse(req.query);
  const data = await reportService.getTrends(range, req.actor!.id, req.actor!.role);
  ok(res, data);
});

export const comparison = asyncRoute(async (_req: Request, res: Response) => {
  const data = await reportService.getComparisonData();
  ok(res, data);
});

export const statusBreakdown = asyncRoute(async (req: Request, res: Response) => {
  const range = dateRangeSchema.parse(req.query);
  const data = await reportService.getStatusBreakdown(range, req.actor!.id, req.actor!.role);
  ok(res, data);
});

export const topAlloys = asyncRoute(async (req: Request, res: Response) => {
  const range = dateRangeSchema.parse(req.query);
  const data = await reportService.getTopAlloys(range, req.actor!.id, req.actor!.role);
  ok(res, data);
});

export const priceHistory = asyncRoute(async (req: Request, res: Response) => {
  const range = dateRangeSchema.parse(req.query);
  const data = await reportService.getPriceHistoryReport(range);
  ok(res, data);
});
