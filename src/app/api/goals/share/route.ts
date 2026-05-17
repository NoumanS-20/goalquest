import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request) {
  const user = await requireUser();
  if (!["MANAGER", "ADMIN"].includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { title, description, target, uomLabel, weightage, recipientIds } = await req.json();
  if (!title || !Array.isArray(recipientIds) || recipientIds.length === 0) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const cycle = await prisma.cycle.findFirst({ where: { isActive: true } });
  if (!cycle) return NextResponse.json({ error: "No active cycle" }, { status: 400 });
  const defaultThrust = await prisma.thrustArea.findFirst();
  if (!defaultThrust) return NextResponse.json({ error: "No thrust areas" }, { status: 400 });

  // Parent goal owned by the manager
  const parent = await prisma.goal.create({
    data: {
      title,
      description: description || null,
      thrustAreaId: defaultThrust.id,
      uomType: "MIN_NUMERIC",
      uomLabel: uomLabel || null,
      target: target ?? null,
      weightage: weightage ?? 20,
      status: "APPROVED",
      progressStatus: "ON_TRACK",
      ownerId: user.id,
      cycleId: cycle.id,
      isShared: true,
      approvedAt: new Date(),
      lockedAt: new Date(),
    },
  });

  for (const rid of recipientIds) {
    const child = await prisma.goal.create({
      data: {
        title,
        description: description || null,
        thrustAreaId: defaultThrust.id,
        uomType: "MIN_NUMERIC",
        uomLabel: uomLabel || null,
        target: target ?? null,
        weightage: weightage ?? 20,
        status: "APPROVED",
        progressStatus: "ON_TRACK",
        ownerId: rid,
        cycleId: cycle.id,
        isShared: true,
        parentGoalId: parent.id,
        approvedAt: new Date(),
        lockedAt: new Date(),
      },
    });
    await prisma.sharedGoal.create({
      data: { goalId: parent.id, recipientId: rid, weightage: weightage ?? 20 },
    });
    await logAudit({
      actorId: user.id,
      goalId: child.id,
      action: "CREATE",
      newValue: `Shared goal pushed: ${title}`,
    });
  }

  return NextResponse.json({ ok: true, count: recipientIds.length });
}
