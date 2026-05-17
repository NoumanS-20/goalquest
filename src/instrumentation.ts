/**
 * Next.js instrumentation hook. Runs once at server boot per runtime.
 *
 * SENTRY_DSN is optional — when unset, Sentry is a no-op. This means the
 * code ships safely even before the DSN is provisioned.
 */

export async function register() {
  if (!process.env.SENTRY_DSN) return;

  if (process.env.NEXT_RUNTIME === "nodejs") {
    const Sentry = await import("@sentry/nextjs");
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
      release: process.env.VERCEL_GIT_COMMIT_SHA,
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
      // Don't capture noisy 4xx; they're business logic, not errors
      ignoreErrors: [/^Unauthorized$/, /^Forbidden$/, /^Not found$/],
    });
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    const Sentry = await import("@sentry/nextjs");
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
      release: process.env.VERCEL_GIT_COMMIT_SHA,
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    });
  }
}

export async function onRequestError(
  err: unknown,
  request: {
    path: string;
    method: string;
    headers: { [key: string]: string | string[] | undefined };
  },
  context: { routerKind: string; routePath: string; routeType: string },
) {
  if (!process.env.SENTRY_DSN) {
    console.error("[onRequestError]", request.method, request.path, err);
    return;
  }
  const Sentry = await import("@sentry/nextjs");
  Sentry.captureRequestError(err, request, context);
}
