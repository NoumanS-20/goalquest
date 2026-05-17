/**
 * Structured logger. In production this emits JSON for log drains (Vercel,
 * Logtail, Axiom). In development it pretty-prints for readability.
 *
 * Keep this dependency-free — adding `pino` works but the bundle cost on
 * serverless cold starts is real. The native console + JSON is sufficient
 * until log volume grows.
 */

type Level = "debug" | "info" | "warn" | "error";

type LogEntry = {
  level: Level;
  msg: string;
  timestamp: string;
  [key: string]: unknown;
};

const isProd = process.env.NODE_ENV === "production";

function emit(level: Level, ctxOrMsg: object | string, maybeMsg?: string) {
  const isObj = typeof ctxOrMsg === "object" && ctxOrMsg !== null;
  const msg = isObj ? (maybeMsg ?? "") : (ctxOrMsg as string);
  const ctx = isObj ? (ctxOrMsg as Record<string, unknown>) : {};

  const entry: LogEntry = {
    level,
    msg,
    timestamp: new Date().toISOString(),
    ...ctx,
  };

  // In production, serialize errors so they don't get [object Object]
  if (entry.err instanceof Error) {
    entry.err = {
      name: entry.err.name,
      message: entry.err.message,
      stack: entry.err.stack,
    };
  }

  if (isProd) {
    // One JSON object per line — what log drains expect
    process.stdout.write(JSON.stringify(entry) + "\n");
  } else {
    const prefix = `[${level.toUpperCase()}]`;
    if (Object.keys(ctx).length > 0) {
      console.log(prefix, msg, ctx);
    } else {
      console.log(prefix, msg);
    }
  }
}

export const logger = {
  debug: (ctx: object | string, msg?: string) => emit("debug", ctx, msg),
  info: (ctx: object | string, msg?: string) => emit("info", ctx, msg),
  warn: (ctx: object | string, msg?: string) => emit("warn", ctx, msg),
  error: (ctx: object | string, msg?: string) => emit("error", ctx, msg),
};
