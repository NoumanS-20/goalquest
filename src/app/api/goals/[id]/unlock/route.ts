import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { logAudit } from "@/lib/audit";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireRole("ADMIN");
  const { id } = await ctx.params;
  const goal = await prisma.goal.findUnique({ where: { id } });
  if (!goal) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.goal.update({
    where: { id },
    data: { status: "DRAFT", lockedAt: null, approvedAt: null },
  });
  await logAudit({ actorId: user.id, goalId: id, action: "UNLOCK", oldValue: goal.status, newValue: "DRAFT" });
  return NextResponse.json({ ok: true });
}
