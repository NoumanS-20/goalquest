import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withRole, readJson } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { MAX_GOALS, MIN_WEIGHTAGE } from "@/lib/validation";

type ShareBody = {
  title?: string;
  description?: string;
  target?: number;
  uomLabel?: string;
  weightage?: number;
  recipientIds?: string[];
};

export const POST = withRole(["MANAGER", "ADMIN"], async ({ user, req }) => {
  const body = await readJson<ShareBody>(req);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { title, description, target, uomLabel, weightage, recipientIds } = body;

  if (!title || !Array.isArray(recipientIds) || recipientIds.length === 0) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const defaultWeight = Number(weightage ?? 20);
  if (!Number.isFinite(defaultWeight) || defaultWeight < MIN_WEIGHTAGE || defaultWeight > 100) {
    return NextResponse.json(
      { error: `Default weightage must be between ${MIN_WEIGHTAGE}% and 100%.` },
      { status: 400 },
    );
  }

  const cycle = await prisma.cycle.findFirst({ where: { isActive: true } });
  if (!cycle) return NextResponse.json({ error: "No active cycle" }, { status: 400 });
  const defaultThrust = await prisma.thrustArea.findFirst();
  if (!defaultThrust) {
    return NextResponse.json({ error: "No thrust areas" }, { status: 400 });
  }

  // Managers can only share to their direct reports
  if (user.role === "MANAGER") {
    const reports = await prisma.user.findMany({
      where: { managerId: user.id },
      select: { id: true },
    });
    const reportIds = new Set(reports.map((r) => r.id));
    const invalid = recipientIds.filter((rid) => !reportIds.has(rid));
    if (invalid.length > 0) {
      return NextResponse.json(
        { error: "Can only share to your direct reports" },
        { status: 403 },
      );
    }
  }

  const goalCounts = await prisma.goal.groupBy({
    by: ["ownerId"],
    where: { ownerId: { in: recipientIds }, cycleId: cycle.id },
    _count: { _all: true },
  });
  const fullRecipient = goalCounts.find((row) => row._count._all >= MAX_GOALS);
  if (fullRecipient) {
    const recipient = await prisma.user.findUnique({ where: { id: fullRecipient.ownerId } });
    return NextResponse.json(
      { error: `${recipient?.name ?? "A recipient"} already has ${MAX_GOALS} goals.` },
      { status: 400 },
    );
  }

  const parent = await prisma.goal.create({
    data: {
      title,
      description: description || null,
      thrustAreaId: defaultThrust.id,
      uomType: "MIN_NUMERIC",
      uomLabel: uomLabel || null,
      target: target ?? null,
      weightage: defaultWeight,
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
        weightage: defaultWeight,
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
      data: { goalId: parent.id, recipientId: rid, weightage: defaultWeight },
    });
    await logAudit({
      actorId: user.id,
      goalId: child.id,
      action: "CREATE",
      newValue: `Shared goal pushed: ${title}`,
    });
  }

  return NextResponse.json({ ok: true, count: recipientIds.length });
});
