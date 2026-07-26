import { Prisma } from "@prisma/client";
import { prisma } from "../config/db.js";
import { HttpError } from "../errors/http-error.js";
import type { AuthIdentity } from "../types/auth.js";

const usernamePattern = /^[a-z0-9][a-z0-9_]{2,29}$/;
const userSelect = {
  id: true,
  authUserId: true,
  username: true,
  email: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

export function normalizeUsername(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function validateUsername(value: unknown) {
  const username = normalizeUsername(value);
  if (!usernamePattern.test(username)) {
    throw new HttpError(
      400,
      "Username must be 3-30 characters using letters, numbers, or underscores",
    );
  }
  return username;
}

function fallbackUsername(identity: AuthIdentity) {
  const base = identity.email
    .split("@")[0]
    ?.toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/^_+/, "")
    .slice(0, 20);
  return `${base || "user"}_${identity.authUserId.slice(0, 8)}`;
}

function requestedUsername(identity: AuthIdentity, value?: unknown) {
  if (value !== undefined) return validateUsername(value);
  const suggested = normalizeUsername(identity.suggestedUsername);
  return usernamePattern.test(suggested) ? suggested : fallbackUsername(identity);
}

function translateUniqueError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    throw new HttpError(409, "That username or email is already in use");
  }
  throw error;
}

export async function ensureUserProfile(
  identity: AuthIdentity,
  usernameValue?: unknown,
) {
  const username = requestedUsername(identity, usernameValue);

  try {
    const byAuthId = await prisma.user.findUnique({
      where: { authUserId: identity.authUserId },
      select: userSelect,
    });

    if (byAuthId) {
      return prisma.user.update({
        where: { id: byAuthId.id },
        data: {
          email: identity.email,
          username: byAuthId.username ?? username,
        },
        select: userSelect,
      });
    }

    const legacyUser = await prisma.user.findUnique({
      where: { email: identity.email },
      select: userSelect,
    });

    if (legacyUser) {
      return prisma.user.update({
        where: { id: legacyUser.id },
        data: { authUserId: identity.authUserId, username },
        select: userSelect,
      });
    }

    return await prisma.user.create({
      data: {
        authUserId: identity.authUserId,
        email: identity.email,
        username,
      },
      select: userSelect,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const concurrentProfile = await prisma.user.findUnique({
        where: { authUserId: identity.authUserId },
        select: userSelect,
      });
      if (concurrentProfile) return concurrentProfile;
    }
    translateUniqueError(error);
  }
}

export async function isUsernameAvailable(value: unknown) {
  const username = validateUsername(value);
  const count = await prisma.user.count({ where: { username } });
  return { username, available: count === 0 };
}
