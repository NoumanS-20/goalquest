/**
 * Rate limiter.
 *
 * In production set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN to use
 * Upstash Redis (serverless-friendly, free tier covers small apps).
 *
 * Without those env vars it falls back to an in-memory bucket per process,
 * which is fine for dev but useless on Vercel's autoscaling serverless
 * (each invocation gets a fresh process, so the limit is bypassed).
 *
 * Logger warns once at boot when Redis is missing in production.
 */

import { logger } from "./logger";

type Result = { ok: boolean; remaining: number; resetAt: number };

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

let warnedAboutMissingRedis = false;
function warnIfMissingRedis() {
  if (warnedAboutMissingRedis) return;
  warnedAboutMissingRedis = true;
  if (process.env.NODE_ENV === "production" && !UPSTASH_URL) {
    logger.warn(
      "Rate limiter falling back to in-memory store — set UPSTASH_REDIS_REST_URL for production.",
    );
  }
}

// In-memory fallback
const buckets = new Map<string, { count: number; resetAt: number }>();

function memoryLimit(key: string, max: number, windowMs: number): Result {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { ok: true, remaining: max - 1, resetAt };
  }
  bucket.count++;
  if (bucket.count > max) {
    return { ok: false, remaining: 0, resetAt: bucket.resetAt };
  }
  return { ok: true, remaining: max - bucket.count, resetAt: bucket.resetAt };
}

async function upstashLimit(
  key: string,
  max: number,
  windowMs: number,
): Promise<Result> {
  const windowSec = Math.ceil(windowMs / 1000);
  // INCR + EXPIRE pattern; atomic via Upstash pipeline
  const url = `${UPSTASH_URL}/pipeline`;
  const body = JSON.stringify([
    ["INCR", key],
    ["EXPIRE", key, String(windowSec), "NX"],
    ["PTTL", key],
  ]);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      "Content-Type": "application/json",
    },
    body,
    cache: "no-store",
  });
  if (!res.ok) {
    logger.error({ status: res.status }, "Upstash rate limit failed, allowing request");
    return { ok: true, remaining: max - 1, resetAt: Date.now() + windowMs };
  }
  const data = (await res.json()) as Array<{ result: number }>;
  const count = data[0]?.result ?? 0;
  const pttl = data[2]?.result ?? windowMs;
  return {
    ok: count <= max,
    remaining: Math.max(0, max - count),
    resetAt: Date.now() + (pttl > 0 ? pttl : windowMs),
  };
}

/**
 * Check the rate limit for `key`. Returns whether the request is allowed,
 * how many requests remain, and when the bucket resets (ms epoch).
 *
 * Suggested limits:
 *   /api/auth/login  →  10 per 5 min per IP
 *   /api/auth/signup →   3 per 1 hour per IP
 *   /api/* (writes)  → 120 per 1 min per session
 */
export async function rateLimit(
  key: string,
  max: number,
  windowMs: number,
): Promise<Result> {
  warnIfMissingRedis();
  if (UPSTASH_URL && UPSTASH_TOKEN) {
    try {
      return await upstashLimit(key, max, windowMs);
    } catch (err) {
      logger.error({ err }, "Upstash unreachable, falling back to memory");
      return memoryLimit(key, max, windowMs);
    }
  }
  return memoryLimit(key, max, windowMs);
}

/**
 * Extract a best-effort client identifier from a request.
 * Vercel sets x-forwarded-for; fall back to a constant so dev still works.
 */
export function clientKey(req: Request, prefix: string): string {
  const xff = req.headers.get("x-forwarded-for");
  const ip = xff?.split(",")[0]?.trim() ?? "local";
  return `rl:${prefix}:${ip}`;
}
