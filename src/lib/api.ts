import { NextResponse } from "next/server";
import { getCurrentUser } from "./session";
import { logger } from "./logger";

export type Role = "EMPLOYEE" | "MANAGER" | "ADMIN";

export type ApiUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  managerId: string | null;
  department: string | null;
};

type Handler<TParams> = (ctx: {
  user: ApiUser;
  req: Request;
  params: TParams;
}) => Promise<Response>;

type RouteContext<TParams> = { params: Promise<TParams> };

/**
 * Wraps a route handler with authentication. Returns 401 if no session.
 * The handler receives the resolved user (never null).
 */
export function withAuth<TParams = Record<string, never>>(
  handler: Handler<TParams>,
) {
  return async (req: Request, ctx?: RouteContext<TParams>): Promise<Response> => {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHENTICATED" },
        { status: 401 },
      );
    }
    const params = ctx ? await ctx.params : ({} as TParams);
    try {
      return await handler({
        user: user as ApiUser,
        req,
        params,
      });
    } catch (err) {
      return handleApiError(err, req.url);
    }
  };
}

/**
 * Wraps a route handler with role enforcement. Returns 401 if no session,
 * 403 if session exists but role is not in the allowed list.
 */
export function withRole<TParams = Record<string, never>>(
  roles: Role | Role[],
  handler: Handler<TParams>,
) {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return withAuth<TParams>(async (ctx) => {
    if (!allowed.includes(ctx.user.role)) {
      return NextResponse.json(
        {
          error: "Forbidden",
          code: "INSUFFICIENT_ROLE",
          required: allowed,
        },
        { status: 403 },
      );
    }
    return handler(ctx);
  });
}

/**
 * Centralised API error handler. Converts unexpected errors into 500s
 * without leaking stack traces, and logs the original for debugging.
 */
export function handleApiError(err: unknown, url?: string): Response {
  const e = err as { message?: string; code?: string; status?: number };

  // Known status mapped errors
  if (e?.status && e.status >= 400 && e.status < 500) {
    return NextResponse.json(
      { error: e.message ?? "Bad request", code: e.code ?? "BAD_REQUEST" },
      { status: e.status },
    );
  }

  logger.error({ err, url }, "Unhandled API error");

  return NextResponse.json(
    {
      error: "Internal server error",
      code: "INTERNAL_ERROR",
      // Include request id in production for support correlation
      requestId: crypto.randomUUID(),
    },
    { status: 500 },
  );
}

/**
 * Parse a JSON body safely. Returns null if missing or malformed.
 */
export async function readJson<T = unknown>(req: Request): Promise<T | null> {
  try {
    const text = await req.text();
    if (!text) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
