/**
 * AuthService — authentication and session management business logic.
 */

import bcrypt from "bcryptjs";
import { ApiError } from "../utils/http.js";
import { audit } from "./audit.js";
import { notify } from "./notifications.js";
import * as userRepo from "../repositories/user.repository.js";
import { prisma } from "../prisma/client.js";
import {
  signAccessToken,
  signRefreshToken,
  tokenHash,
  verifyRefreshToken
} from "../middleware/auth.js";
import { env } from "../config/env.js";
import type { Response } from "express";
import type { LoginInput, ProfileUpdateInput } from "../validations/index.js";

const REFRESH_COOKIE = "mcms_refresh";

function setRefreshCookie(res: Response, token: string, rememberMe?: boolean) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.nodeEnv === "production",
    path: "/api/auth",
    ...(rememberMe ? { maxAge: env.refreshTokenTtlDays * 24 * 60 * 60 * 1000 } : {})
  });
}

async function issueSession(
  user: { id: string; email: string; name: string; role: { name: string } },
  res: Response,
  rememberMe?: boolean
) {
  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role.name
  });
  const refreshToken = signRefreshToken(user.id);
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: tokenHash(refreshToken),
      expiresAt: new Date(Date.now() + env.refreshTokenTtlDays * 24 * 60 * 60 * 1000)
    }
  });
  setRefreshCookie(res, refreshToken, rememberMe);
  return {
    accessToken,
    user: { id: user.id, email: user.email, name: user.name, role: user.role.name }
  };
}

export async function login(input: LoginInput, res: Response, ip?: string) {
  const user = await userRepo.findUserByEmail(input.email.toLowerCase());
  if (!user || user.status !== "ACTIVE") {
    await audit({
      action: "LOGIN_FAILED",
      entity: "Authentication",
      details: { email: input.email, reason: "unknown-user" },
      ipAddress: ip
    });
    throw new ApiError(401, "Email or password is incorrect.");
  }
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new ApiError(423, "Account is temporarily locked after failed logins.");
  }
  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    const next = user.failedLoginCount + 1;
    await userRepo.incrementFailedLogin(user.id, next);
    await audit({
      userId: user.id,
      action: "LOGIN_FAILED",
      entity: "Authentication",
      details: { reason: "bad-password" },
      ipAddress: ip
    });
    throw new ApiError(401, "Email or password is incorrect.");
  }
  await userRepo.recordSuccessfulLogin(user.id);
  await audit({
    userId: user.id,
    action: "LOGIN",
    entity: "Authentication",
    details: { role: user.role.name },
    ipAddress: ip
  });
  return issueSession(user, res, input.rememberMe);
}

export async function refresh(refreshToken: string | undefined, res: Response) {
  if (!refreshToken) throw new ApiError(401, "Refresh session missing.");
  const claims = verifyRefreshToken(refreshToken);
  const existing = await prisma.refreshToken.findUnique({
    where: { tokenHash: tokenHash(refreshToken) },
    include: { user: { include: { role: true } } }
  });
  if (
    !existing ||
    existing.revokedAt ||
    existing.expiresAt < new Date() ||
    existing.userId !== claims.sub
  ) {
    throw new ApiError(401, "Refresh session is no longer valid.");
  }
  const replacement = signRefreshToken(existing.userId);
  await prisma.$transaction([
    prisma.refreshToken.update({
      where: { id: existing.id },
      data: { revokedAt: new Date(), replacedByHash: tokenHash(replacement) }
    }),
    prisma.refreshToken.create({
      data: {
        userId: existing.userId,
        tokenHash: tokenHash(replacement),
        expiresAt: new Date(Date.now() + env.refreshTokenTtlDays * 24 * 60 * 60 * 1000)
      }
    })
  ]);
  setRefreshCookie(res, replacement);
  return {
    accessToken: signAccessToken({
      sub: existing.user.id,
      email: existing.user.email,
      name: existing.user.name,
      role: existing.user.role.name
    }),
    user: {
      id: existing.user.id,
      email: existing.user.email,
      name: existing.user.name,
      role: existing.user.role.name
    }
  };
}

export async function logout(refreshToken: string | undefined, res: Response) {
  if (refreshToken) {
    await prisma.refreshToken.updateMany({
      where: { tokenHash: tokenHash(refreshToken), revokedAt: null },
      data: { revokedAt: new Date() }
    });
  }
  res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
  if (!user) throw new ApiError(404, "User not found.");
  return { id: user.id, name: user.name, email: user.email, role: user.role.name, department: user.department };
}

export async function updateProfile(
  userId: string,
  input: ProfileUpdateInput,
  ip?: string
) {
  const updateData: Record<string, unknown> = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.department !== undefined) updateData.department = input.department;
  if (input.password) updateData.passwordHash = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    include: { role: true }
  });
  await audit({
    userId,
    action: "UPDATE_PROFILE",
    entity: "User",
    entityId: user.id,
    details: { name: user.name, department: user.department },
    ipAddress: ip
  });
  return { id: user.id, name: user.name, email: user.email, role: user.role.name, department: user.department };
}

export const REFRESH_COOKIE_NAME = REFRESH_COOKIE;
