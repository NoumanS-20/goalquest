import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { checkSubmitReady } from "@/lib/validation";
import { logAudit } from "@/lib/audit";

export async function POST() {
  const user = await requireUser();
  const cycle = await prisma.cycle.findFirst({ where: { isActive: true } });
  if (!cycle) return NextResponse.json({ error: "No active cycle" }, { status: 400 });

  const goals = await prisma.goal.findMany({
    where: { ownerId: user.id, cycleId: cycle.id },
  });
  const check = checkSubmitReady(goals);
  if (!check.ok) return NextResponse.json({ error: check.reason }, { status: 400 });

  await prisma.goal.updateMany({
    where: { ownerId: user.id, cycleId: cycle.id, status: { in: ["DRAFT", "RETURNED"] } },
    data: { status: "SUBMITTED" },
  });

  for (const g of goals) {
    await logAudit({ actorId: user.id, goalId: g.id, action: "UPDATE", field: "status", oldValue: g.status, newValue: "SUBMITTED" });
  }

  return NextResponse.json({ ok: true });
}
