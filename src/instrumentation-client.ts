/**
 * Client-side Sentry init. Loaded into every page automatically.
 * No-op when NEXT_PUBLIC_SENTRY_DSN is unset.
 */

import * as Sentry from "@sentry/nextjs";

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
    // Replay on errors (10% sessions, 100% of error sessions)
    replaysSessionSampleRate: 0.0,
    replaysOnErrorSampleRate: 1.0,
    tracesSampleRate: 0.1,
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    ignoreErrors: [
      // Browser extensions
      /extension\//i,
      /^chrome:\/\//i,
      // Network flakiness, not our bug
      "Failed to fetch",
      "Load failed",
      "NetworkError",
      // ResizeObserver loop limit — harmless
      "ResizeObserver loop",
    ],
  });
}
