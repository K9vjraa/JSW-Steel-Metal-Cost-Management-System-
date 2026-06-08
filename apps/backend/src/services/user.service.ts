/**
 * UserService — business logic for user management (ADMIN only).
 */

import bcrypt from "bcryptjs";
import { audit } from "./audit.js";
import * as userRepo from "../repositories/user.repository.js";
import type { CreateUserInput, UpdateUserInput, UserQueryInput } from "../validations/index.js";

export async function listUsers(query: UserQueryInput) {
  return userRepo.listUsers(query);
}

export async function createUser(input: CreateUserInput, actorId: string, ip?: string) {
  const passwordHash = await bcrypt.hash(input.password, 12);
  const row = await userRepo.createUser({
    name: input.name,
    email: input.email.toLowerCase(),
    passwordHash,
    department: input.department,
    status: input.status,
    roleId: input.roleId
  });
  await audit({
    userId: actorId,
    action: "CREATE",
    entity: "User",
    entityId: row.id,
    details: { email: row.email, role: (row as any).role?.name },
    ipAddress: ip
  });
  return row;
}

export async function updateUser(
  id: string,
  input: UpdateUserInput,
  actorId: string,
  ip?: string
) {
  const passwordHash = input.password ? await bcrypt.hash(input.password, 12) : undefined;
  const row = await userRepo.updateUser(id, {
    name: input.name,
    email: input.email?.toLowerCase(),
    passwordHash,
    department: input.department,
    status: input.status,
    roleId: input.roleId
  });
  await audit({
    userId: actorId,
    action: "UPDATE",
    entity: "User",
    entityId: row.id,
    details: { email: row.email },
    ipAddress: ip
  });
  return row;
}

export async function deactivateUser(id: string, actorId: string, ip?: string) {
  await userRepo.deactivateUser(id);
  await audit({
    userId: actorId,
    action: "DEACTIVATE",
    entity: "User",
    entityId: id,
    details: {},
    ipAddress: ip
  });
}
