/**
 * UserController — HTTP handlers for user management (ADMIN only).
 */

import type { Request, Response } from "express";
import { asyncRoute } from "../utils/http.js";
import { ok, created, noContent, paginated, buildPagination } from "../utils/response.js";
import * as userService from "../services/user.service.js";
import { createUserSchema, updateUserSchema, userQuerySchema } from "../validations/index.js";

export const listUsers = asyncRoute(async (req: Request, res: Response) => {
  const query = userQuerySchema.parse(req.query);
  const result = await userService.listUsers(query);
  res.json({
    success: true,
    data: result.data,
    roles: result.roles,
    pagination: buildPagination(result.page, result.limit, result.total)
  });
});

export const createUser = asyncRoute(async (req: Request, res: Response) => {
  const input = createUserSchema.parse(req.body);
  const row = await userService.createUser(input, req.actor!.id, req.ip);
  created(res, row);
});

export const updateUser = asyncRoute(async (req: Request, res: Response) => {
  const input = updateUserSchema.parse(req.body);
  const row = await userService.updateUser(String(req.params.id), input, req.actor!.id, req.ip);
  ok(res, row);
});

export const deactivateUser = asyncRoute(async (req: Request, res: Response) => {
  await userService.deactivateUser(String(req.params.id), req.actor!.id, req.ip);
  noContent(res);
});
