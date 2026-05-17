import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
} from "@/lib/session";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { readJson } from "@/lib/api";
import { logger } from "@/lib/logger";

const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(200),
});

// Pre-computed argon2 hash of a random string. Used to keep timing constant
// when the user doesn't exist, so attackers can't probe valid emails.
const DECOY_HASH =
  "$argon2id$v=19$m=19456,t=2,p=1$c29tZS1zYWx0LXZhbHVlcw$2yQ5RnPHQK7C9pTKD0ZqXrEPLnYZqJHvBfXJtVOoOuM";

export async function POST(req: Request) {
  // Rate limit: 10 attempts per 5 min per IP
  const rl = await rateLimit(clientKey(req, "login"), 10, 5 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
        },
      },
    );
  }

  const body = await readJson<unknown>(req);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Email and password required" },
      { status: 400 },
    );
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  // Always do a verify, even when the user doesn't exist, to keep timing flat
  const hashToCheck = user?.password ?? DECOY_HASH;
  const { valid, needsRehash } = await verifyPassword(password, hashToCheck);

  if (!user || !valid) {
    logger.info({ email: email.toLowerCase() }, "Failed login attempt");
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Opportunistically upgrade legacy bcrypt hashes to argon2id
  if (needsRehash) {
    try {
      const newHash = await hashPassword(password);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: newHash },
      });
      logger.info({ userId: user.id }, "Upgraded password hash to argon2id");
    } catch (err) {
      logger.error({ err, userId: user.id }, "Failed to upgrade password hash");
      // Don't fail the login if the rehash fails
    }
  }

  await destroySession();
  await createSession(user.id);

  return NextResponse.json({
    ok: true,
    user: { id: user.id, role: user.role, name: user.name },
  });
}
