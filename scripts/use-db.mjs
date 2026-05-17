#!/usr/bin/env node
/**
 * Swap the active Prisma schema between SQLite (dev) and Postgres (prod).
 *
 * Usage:
 *   node scripts/use-db.mjs sqlite
 *   node scripts/use-db.mjs postgres
 *
 * Prisma's CLI reads schema.prisma by default. We keep two source-of-truth
 * files and copy the chosen one over schema.prisma. The original SQLite
 * schema lives in schema.sqlite.prisma (kept for reference).
 */

import { existsSync, copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const prismaDir = resolve(__dirname, "..", "prisma");

const target = process.argv[2];
if (target !== "sqlite" && target !== "postgres") {
  console.error("Usage: node scripts/use-db.mjs <sqlite|postgres>");
  process.exit(1);
}

const liveSchema = resolve(prismaDir, "schema.prisma");
const sqliteSchema = resolve(prismaDir, "schema.sqlite.prisma");
const postgresSchema = resolve(prismaDir, "schema.postgres.prisma");

// First-time use: snapshot the current schema as the sqlite copy
if (!existsSync(sqliteSchema) && existsSync(liveSchema)) {
  const liveContent = readFileSync(liveSchema, "utf8");
  if (liveContent.includes('provider = "sqlite"')) {
    writeFileSync(sqliteSchema, liveContent);
    console.log("Snapshot current schema.prisma → schema.sqlite.prisma");
  }
}

const source = target === "sqlite" ? sqliteSchema : postgresSchema;
if (!existsSync(source)) {
  console.error(`Source schema not found: ${source}`);
  process.exit(1);
}

copyFileSync(source, liveSchema);
console.log(`✓ Active schema is now ${target}.`);
console.log("");
console.log("Next steps:");
if (target === "postgres") {
  console.log("  1. Ensure DATABASE_URL (pooled) and DIRECT_URL (direct) are set in .env");
  console.log("  2. npm run db:generate");
  console.log("  3. npm run db:migrate:deploy   # apply existing migrations to prod DB");
  console.log("  4. npm run db:seed              # optional, only for staging");
} else {
  console.log("  1. npm run db:generate");
  console.log("  2. npm run db:reset && npm run db:seed");
}
