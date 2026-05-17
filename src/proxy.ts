import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge middleware.
 *
 * 1. **CSRF — Origin/Referer check** on state-changing requests.
 *    SameSite=Lax cookies are our first line of defense; this is the second.
 *    We reject any POST/PATCH/PUT/DELETE whose Origin doesn't match the
 *    request's own host. Cron jobs bypass via Bearer token (checked in-route).
 *
 * 2. **Request ID** — emit a per-request UUID into `x-request-id` so logs,
 *    Sentry events, and client error reports can be correlated.
 *
 * 3. **Method allowlist** — only permit standard HTTP methods. Stops
 *    weird trace/connect probes hitting the app.
 */

const MUTATING = new Set(["POST", "PATCH", "PUT", "DELETE"]);
const ALLOWED_METHODS = new Set([
  "GET",
  "HEAD",
  "OPTIONS",
  "POST",
  "PATCH",
  "PUT",
  "DELETE",
]);

export function proxy(req: NextRequest) {
  if (!ALLOWED_METHODS.has(req.method)) {
    return new NextResponse("Method Not Allowed", { status: 405 });
  }

  // Generate a request id for correlation
  const requestId =
    req.headers.get("x-request-id") ?? crypto.randomUUID();

  if (MUTATING.has(req.method)) {
    // Cron and server-to-server calls present a Bearer token; let those through
    // and let the route check the token. Everything else needs an Origin match.
    const hasBearer = req.headers.get("authorization")?.startsWith("Bearer ");
    if (!hasBearer) {
      const origin = req.headers.get("origin");
      const referer = req.headers.get("referer");
      const host = req.headers.get("host");

      // Build the expected origin from host (Vercel terminates TLS so x-forwarded-proto is set)
      const proto =
        req.headers.get("x-forwarded-proto") ??
        (host?.startsWith("localhost") ? "http" : "https");
      const expectedOrigin = `${proto}://${host}`;

      const sourceOrigin = origin ?? (referer ? new URL(referer).origin : null);

      if (!sourceOrigin || sourceOrigin !== expectedOrigin) {
        return NextResponse.json(
          { error: "Cross-origin request blocked", code: "CSRF_REJECTED" },
          { status: 403, headers: { "x-request-id": requestId } },
        );
      }
    }
  }

  const res = NextResponse.next();
  res.headers.set("x-request-id", requestId);
  return res;
}

export const config = {
  // Run on every request except Next internals, static files, and SEO endpoints
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|sitemap.xml|robots.txt|manifest.webmanifest|api/og|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf)$).*)",
  ],
};
