/**
 * Settings routes — thin wiring to SettingsController.
 */

import { Router } from "express";
import { allowRoles } from "../middleware/auth.js";
import * as ctrl from "../controllers/settings.controller.js";

export const settingsRoutes = Router();

// ── System Settings ───────────────────────────────────────────────────────────
settingsRoutes.get("/", ctrl.listSettings);
settingsRoutes.get("/:key", ctrl.getSetting);
settingsRoutes.put("/", allowRoles("ADMIN"), ctrl.bulkUpdateSettings);
settingsRoutes.put("/:key", allowRoles("ADMIN"), ctrl.updateSetting);

// ── GST Slabs ─────────────────────────────────────────────────────────────────
settingsRoutes.get("/gst/slabs", ctrl.listGstSlabs);
settingsRoutes.post("/gst/slabs", allowRoles("ADMIN"), ctrl.createGstSlab);
settingsRoutes.put("/gst/slabs/:id", allowRoles("ADMIN"), ctrl.updateGstSlab);
settingsRoutes.delete("/gst/slabs/:id", allowRoles("ADMIN"), ctrl.deactivateGstSlab);
