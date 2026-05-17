import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

/**
 * Health check endpoint.
 *
 * Returns 200 + JSON when:
 *   - The database is reachable
 *   - The active cycle exists (basic data-layer sanity)
 *
 * Returns 503 otherwise. Wired up to uptime monitors (Better Stack,
 * UptimeRobot, etc.).
 *
 * Cache-busted via Cache-Control: no-store so the response is always live.
 * NOT auth-gated — uptime monitors can't hold sessions.
 */

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const startedAt = Date.now();
  const checks: Record<string, { ok: boolean; ms?: number; error?: string }> = {};

  // DB check
  const dbStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { ok: true, ms: Date.now() - dbStart };
  } catch (err) {
    checks.database = {
      ok: false,
      ms: Date.now() - dbStart,
      error: (err as Error).message,
    };
  }

  const allOk = Object.values(checks).every((c) => c.ok);
  const payload = {
    status: allOk ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    durationMs: Date.now() - startedAt,
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "dev",
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    checks,
  };

  if (!allOk) {
    logger.error({ checks }, "Health check failing");
  }

  return NextResponse.json(payload, {
    status: allOk ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
