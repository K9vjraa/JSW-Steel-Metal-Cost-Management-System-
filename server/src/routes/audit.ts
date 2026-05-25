import { Router } from "express";
import { asyncRoute, pageArgs } from "../lib/http.js";
import { prisma } from "../lib/prisma.js";
import { allowRoles } from "../middleware/auth.js";

export const auditRoutes = Router();

auditRoutes.get("/", allowRoles("Admin", "Finance"), asyncRoute(async (req, res) => {
  const { page, limit, skip } = pageArgs(req.query);
  const [total, data] = await prisma.$transaction([
    prisma.auditLog.count(),
    prisma.auditLog.findMany({ include: { user: { select: { name: true, email: true } } }, orderBy: { createdAt: "desc" }, skip, take: limit })
  ]);
  res.json({ data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}));
