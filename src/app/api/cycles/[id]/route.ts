import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withRole, readJson } from "@/lib/api";

const DATE_FIELDS = ["goalSetOpen", "q1Open", "q2Open", "q3Open", "q4Open"] as const;
const NUM_FIELDS = ["escSubmitDays", "escApproveDays", "escCheckinDays"] as const;

export const PATCH = withRole<{ id: string }>("ADMIN", async ({ req, params }) => {
  const { id } = params;
  const body = await readJson<Record<string, unknown>>(req);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  for (const k of DATE_FIELDS) {
    const v = body[k];
    if (v) {
      const d = new Date(String(v));
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json({ error: `Invalid date for ${k}` }, { status: 400 });
      }
      data[k] = d;
    }
  }
  for (const k of NUM_FIELDS) {
    const v = body[k];
    if (v != null) {
      const n = Number(v);
      if (!Number.isFinite(n) || n < 0) {
        return NextResponse.json({ error: `Invalid number for ${k}` }, { status: 400 });
      }
      data[k] = n;
    }
  }

  await prisma.cycle.update({ where: { id }, data });
  return NextResponse.json({ ok: true });
});
