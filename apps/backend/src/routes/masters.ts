/**
 * Master data routes — thin wiring to MetalController and GradeController.
 * All CRUD for metals, grades, raw materials, suppliers, prices, and alloys.
 */

import { Router } from "express";
import { allowRoles } from "../middleware/auth.js";
import * as metalCtrl from "../controllers/metal.controller.js";
import * as gradeCtrl from "../controllers/grade.controller.js";

export const masterRoutes = Router();

// ── Metals ────────────────────────────────────────────────────────────────────
masterRoutes.get("/metals", metalCtrl.listMetals);
masterRoutes.post("/metals", allowRoles("ADMIN"), metalCtrl.createMetal);
masterRoutes.put("/metals/:id", allowRoles("ADMIN"), metalCtrl.updateMetal);
masterRoutes.delete("/metals/:id", allowRoles("ADMIN"), metalCtrl.deactivateMetal);

// ── Grades ────────────────────────────────────────────────────────────────────
masterRoutes.get("/grades", gradeCtrl.listGrades);
masterRoutes.post("/grades", allowRoles("ADMIN"), gradeCtrl.createGrade);
masterRoutes.put("/grades/:id", allowRoles("ADMIN"), gradeCtrl.updateGrade);
masterRoutes.delete("/grades/:id", allowRoles("ADMIN"), gradeCtrl.deactivateGrade);

// ── Raw Materials ─────────────────────────────────────────────────────────────
masterRoutes.get("/raw-materials", metalCtrl.listRawMaterials);
masterRoutes.post("/raw-materials", allowRoles("ADMIN"), metalCtrl.createRawMaterial);
masterRoutes.put("/raw-materials/:id", allowRoles("ADMIN"), metalCtrl.updateRawMaterial);
masterRoutes.delete("/raw-materials/:id", allowRoles("ADMIN"), metalCtrl.deactivateRawMaterial);

// ── Suppliers ─────────────────────────────────────────────────────────────────
masterRoutes.get("/suppliers", metalCtrl.listSuppliers);
masterRoutes.post("/suppliers", allowRoles("ADMIN"), metalCtrl.createSupplier);
masterRoutes.put("/suppliers/:id", allowRoles("ADMIN"), metalCtrl.updateSupplier);
masterRoutes.delete("/suppliers/:id", allowRoles("ADMIN"), metalCtrl.deactivateSupplier);

// ── Price List ────────────────────────────────────────────────────────────────
masterRoutes.get("/prices", metalCtrl.listPrices);
masterRoutes.post("/prices", allowRoles("ADMIN"), metalCtrl.createPrice);
masterRoutes.put("/prices/:id", allowRoles("ADMIN"), metalCtrl.updatePrice);
masterRoutes.delete("/prices/:id", allowRoles("ADMIN"), metalCtrl.deactivatePrice);
masterRoutes.get("/price-history", metalCtrl.listPriceHistory);

// ── Alloys ────────────────────────────────────────────────────────────────────
masterRoutes.get("/alloys", metalCtrl.listAlloys);
masterRoutes.post("/alloys", allowRoles("ADMIN", "EMPLOYEE"), metalCtrl.createAlloy);
masterRoutes.put("/alloys/:id", allowRoles("ADMIN", "EMPLOYEE"), metalCtrl.updateAlloy);
masterRoutes.delete("/alloys/:id", allowRoles("ADMIN"), metalCtrl.deactivateAlloy);
