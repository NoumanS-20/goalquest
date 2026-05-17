import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/session";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireRole("ADMIN");
  const { id } = await ctx.params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  for (const k of ["goalSetOpen", "q1Open", "q2Open", "q3Open", "q4Open"]) {
    if (body[k]) data[k] = new Date(body[k]);
  }
  for (const k of ["escSubmitDays", "escApproveDays", "escCheckinDays"]) {
    if (body[k] != null) data[k] = Number(body[k]);
  }
  await prisma.cycle.update({ where: { id }, data });
  return NextResponse.json({ ok: true });
}
