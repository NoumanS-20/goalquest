import { cookies } from "next/headers";
import { prisma } from "./db";
import { randomBytes, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";
import * as argon2 from "@node-rs/argon2";

const SESSION_COOKIE = "gq_session";
const SESSION_DAYS = 30;

// OWASP-recommended argon2id parameters (2024)
const ARGON_OPTS = {
  memoryCost: 19456, // 19 MiB
  timeCost: 2,
  parallelism: 1,
} as const;

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await prisma.session.create({
    data: { userId, token, expiresAt },
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { token } });
  }
  jar.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { token },
  });
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } });
    return null;
  }
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });
  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function requireRole(roles: string | string[]) {
  const user = await requireUser();
  const list = Array.isArray(roles) ? roles : [roles];
  if (!list.includes(user.role)) throw new Error("FORBIDDEN");
  return user;
}

/**
 * Hash a password with argon2id (OWASP 2024 params).
 * New hashes always use argon2id. bcrypt is only kept around for verification
 * of legacy hashes already in the DB (see verifyPassword).
 */
export async function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, ARGON_OPTS);
}

/**
 * Verify a password against either argon2id or legacy bcrypt hashes.
 * Returns `{ valid, needsRehash }` so callers can transparently upgrade
 * old bcrypt users to argon2id on their next successful login.
 */
export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<{ valid: boolean; needsRehash: boolean }> {
  // bcrypt hashes start with $2a$, $2b$, or $2y$
  if (hash.startsWith("$2")) {
    const valid = await bcrypt.compare(plain, hash);
    return { valid, needsRehash: valid };
  }
  // argon2 hashes start with $argon2
  if (hash.startsWith("$argon2")) {
    const valid = await argon2.verify(hash, plain);
    return { valid, needsRehash: false };
  }
  return { valid: false, needsRehash: false };
}

/**
 * Constant-time string compare for tokens/secrets.
 * Use when comparing CSRF tokens, cron secrets, etc.
 */
export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export async function switchToUser(userId: string) {
  // For demo: switch sessions
  await destroySession();
  await createSession(userId);
}
