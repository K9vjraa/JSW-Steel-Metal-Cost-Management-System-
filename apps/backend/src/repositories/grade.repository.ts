/**
 * GradeRepository — Prisma data-access for Grade model.
 */

import { prisma, paginate } from "./base.repository.js";
import { tableSort } from "../utils/table.js";
import type { CreateGradeInput, UpdateGradeInput, GradeQueryInput } from "../validations/index.js";

const gradeSortFields = ["name", "subGrade", "multiplier", "extraPrice", "status", "createdAt"] as const;

export async function listGrades(query: GradeQueryInput) {
  const { page, limit } = query;
  const skip = (page - 1) * limit;
  const sort = tableSort(
    { sortBy: query.sortBy, sortDir: query.sortDir },
    gradeSortFields,
    "name",
    "asc"
  );
  const where = {
    ...(query.metalId ? { metalId: query.metalId } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: "insensitive" as const } },
            { subGrade: { contains: query.search, mode: "insensitive" as const } }
          ]
        }
      : {})
  };
  const [total, data] = await paginate(
    prisma.grade.count({ where }),
    prisma.grade.findMany({ where, include: { metal: true }, skip, take: limit, orderBy: sort.orderBy })
  );
  return { data, total, page, limit };
}

export async function createGrade(data: CreateGradeInput) {
  return prisma.grade.create({ data });
}

export async function updateGrade(id: string, data: UpdateGradeInput) {
  return prisma.grade.update({ where: { id }, data });
}

export async function deactivateGrade(id: string) {
  return prisma.grade.update({ where: { id }, data: { status: "INACTIVE" } });
}

export async function findGradeById(id: string) {
  return prisma.grade.findUnique({ where: { id }, include: { metal: true } });
}
