/**
 * GradeController — HTTP handlers for grade master data.
 */

import type { Request, Response } from "express";
import { asyncRoute } from "../utils/http.js";
import { ok, created, noContent, paginated, buildPagination } from "../utils/response.js";
import * as metalService from "../services/metal.service.js";
import {
  createGradeSchema,
  updateGradeSchema,
  gradeQuerySchema
} from "../validations/index.js";

export const listGrades = asyncRoute(async (req: Request, res: Response) => {
  const query = gradeQuerySchema.parse(req.query);
  const result = await metalService.listGrades(query);
  paginated(res, result.data, buildPagination(result.page, result.limit, result.total));
});

export const createGrade = asyncRoute(async (req: Request, res: Response) => {
  const data = createGradeSchema.parse(req.body);
  const row = await metalService.createGrade(data, req.actor!.id, req.ip);
  created(res, row);
});

export const updateGrade = asyncRoute(async (req: Request, res: Response) => {
  const data = updateGradeSchema.parse(req.body);
  const row = await metalService.updateGrade(String(req.params.id), data, req.actor!.id, req.ip);
  ok(res, row);
});

export const deactivateGrade = asyncRoute(async (req: Request, res: Response) => {
  await metalService.deactivateGrade(String(req.params.id), req.actor!.id, req.ip);
  noContent(res);
});
