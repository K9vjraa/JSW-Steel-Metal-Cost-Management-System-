/**
 * AuthController — HTTP handlers for authentication routes.
 * Thin layer: validates input, calls AuthService, writes HTTP response.
 */

import type { Request, Response } from "express";
import { asyncRoute } from "../utils/http.js";
import { ok, noContent } from "../utils/response.js";
import * as authService from "../services/auth.service.js";
import { loginSchema, profileUpdateSchema } from "../validations/index.js";

export const login = asyncRoute(async (req: Request, res: Response) => {
  const input = loginSchema.parse(req.body);
  const session = await authService.login(input, res, req.ip);
  res.json(session);
});

export const refresh = asyncRoute(async (req: Request, res: Response) => {
  const token = req.cookies["mcms_refresh"] as string | undefined;
  const session = await authService.refresh(token, res);
  res.json(session);
});

export const logout = asyncRoute(async (req: Request, res: Response) => {
  const token = req.cookies["mcms_refresh"] as string | undefined;
  await authService.logout(token, res);
  noContent(res);
});

export const me = asyncRoute(async (req: Request, res: Response) => {
  const data = await authService.getMe(req.actor!.id);
  ok(res, data);
});

export const updateProfile = asyncRoute(async (req: Request, res: Response) => {
  const input = profileUpdateSchema.parse(req.body);
  const data = await authService.updateProfile(req.actor!.id, input, req.ip);
  ok(res, data);
});
