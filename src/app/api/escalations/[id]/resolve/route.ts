import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/session";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireRole("ADMIN");
  const { id } = await ctx.params;
  await prisma.escalation.update({
    where: { id },
    data: { resolved: true, resolvedAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}
