/**
 * Auth routes — thin wiring to AuthController.
 * All business logic lives in controllers/auth.controller.ts → services/auth.service.ts.
 */

import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import * as ctrl from "../controllers/auth.controller.js";

export const authRoutes = Router();

authRoutes.post("/login", ctrl.login);
authRoutes.post("/refresh", ctrl.refresh);
authRoutes.post("/logout", ctrl.logout);
authRoutes.get("/me", authenticate, ctrl.me);
authRoutes.put("/profile", authenticate, ctrl.updateProfile);
