/**
 * UserRepository — Prisma data-access for User and Role models.
 */

import { prisma, paginate } from "./base.repository.js";
import { tableSort } from "../utils/table.js";
import type { UserQueryInput } from "../validations/index.js";

const userSortFields = ["name", "email", "department", "status", "lastLoginAt", "createdAt"] as const;

export async function listUsers(query: UserQueryInput) {
  const { page, limit } = query;
  const skip = (page - 1) * limit;
  const sort = tableSort(
    { sortBy: query.sortBy, sortDir: query.sortDir },
    userSortFields,
    "createdAt",
    "desc"
  );
  const where = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: "insensitive" as const } },
            { email: { contains: query.search, mode: "insensitive" as const } },
            { department: { contains: query.search, mode: "insensitive" as const } }
          ]
        }
      : {})
  };
  const [total, data] = await paginate(
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, department: true, status: true, lastLoginAt: true, role: true },
      orderBy: sort.orderBy,
      skip,
      take: limit
    })
  );
  const roles = await prisma.role.findMany({ orderBy: { name: "asc" } });
  return { data, total, page, limit, roles };
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, department: true, status: true, role: true }
  });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email }, include: { role: true } });
}

export async function createUser(data: {
  name: string;
  email: string;
  passwordHash: string;
  department?: string;
  status: string;
  roleId: string;
}) {
  return prisma.user.create({
    data,
    select: { id: true, name: true, email: true, role: true, department: true, status: true }
  });
}

export async function updateUser(
  id: string,
  data: {
    name?: string;
    email?: string;
    passwordHash?: string;
    department?: string;
    status?: string;
    roleId?: string;
  }
) {
  return prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true, department: true, status: true }
  });
}

export async function deactivateUser(id: string) {
  return prisma.user.update({ where: { id }, data: { status: "INACTIVE" } });
}

export async function incrementFailedLogin(id: string, failedCount: number) {
  return prisma.user.update({
    where: { id },
    data: {
      failedLoginCount: failedCount,
      lockedUntil: failedCount >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null
    }
  });
}

export async function recordSuccessfulLogin(id: string) {
  return prisma.user.update({
    where: { id },
    data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() }
  });
}

export async function listRoles() {
  return prisma.role.findMany({ orderBy: { name: "asc" } });
}
