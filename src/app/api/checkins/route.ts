import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { computeScore } from "@/lib/scoring";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request) {
  const user = await requireUser();
  const { goalId, quarter, actualValue, actualDate, notes, progressStatus } = await req.json();

  const goal = await prisma.goal.findUnique({ where: { id: goalId } });
  if (!goal) return NextResponse.json({ error: "Goal not found" }, { status: 404 });
  if (goal.ownerId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (goal.status !== "APPROVED" && goal.status !== "LOCKED") {
    return NextResponse.json({ error: "Goal must be approved before check-in" }, { status: 400 });
  }

  const val = actualValue != null && actualValue !== "" ? Number(actualValue) : null;
  const dt = actualDate ? new Date(actualDate) : null;
  const score = computeScore(goal.uomType, goal.target, val, goal.deadline, dt);

  const existing = await prisma.checkIn.findUnique({
    where: { goalId_quarter: { goalId, quarter } },
  });

  if (existing) {
    await prisma.checkIn.update({
      where: { id: existing.id },
      data: { actualValue: val, actualDate: dt, notes: notes || null, score },
    });
  } else {
    await prisma.checkIn.create({
      data: { goalId, quarter, actualValue: val, actualDate: dt, notes: notes || null, score },
    });
  }

  if (progressStatus) {
    await prisma.goal.update({ where: { id: goalId }, data: { progressStatus } });
  }

  await logAudit({
    actorId: user.id,
    goalId,
    action: "CHECKIN",
    field: quarter,
    newValue: `${val ?? "—"} (score ${Math.round(score)}%)`,
  });

  // Sync to children if this is a shared goal parent
  if (!goal.parentGoalId) {
    const children = await prisma.goal.findMany({ where: { parentGoalId: goalId } });
    for (const c of children) {
      const cExisting = await prisma.checkIn.findUnique({
        where: { goalId_quarter: { goalId: c.id, quarter } },
      });
      const data = { actualValue: val, actualDate: dt, notes: notes || null, score };
      if (cExisting) {
        await prisma.checkIn.update({ where: { id: cExisting.id }, data });
      } else {
        await prisma.checkIn.create({ data: { goalId: c.id, quarter, ...data } });
      }
    }
  }

  return NextResponse.json({ ok: true, score });
}
