import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth, readJson } from "@/lib/api";
import { goalSchema, MAX_GOALS } from "@/lib/validation";
import { logAudit } from "@/lib/audit";

export const POST = withAuth(async ({ user, req }) => {
  const body = await readJson<Record<string, unknown>>(req);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = goalSchema.safeParse({
    ...body,
    target: body.target != null && body.target !== "" ? Number(body.target) : null,
    weightage: Number(body.weightage),
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const cycle = await prisma.cycle.findFirst({ where: { isActive: true } });
  if (!cycle) return NextResponse.json({ error: "No active cycle" }, { status: 400 });
  if (new Date() < cycle.goalSetOpen) {
    return NextResponse.json(
      { error: `Goal setting opens on ${cycle.goalSetOpen.toLocaleDateString("en-IN")}.` },
      { status: 400 },
    );
  }

  const existing = await prisma.goal.count({
    where: { ownerId: user.id, cycleId: cycle.id },
  });
  if (existing >= MAX_GOALS) {
    return NextResponse.json(
      { error: `Max ${MAX_GOALS} goals per employee.` },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const goal = await prisma.goal.create({
    data: {
      title: data.title,
      description: data.description || null,
      thrustAreaId: data.thrustAreaId,
      uomType: data.uomType,
      uomLabel: data.uomLabel || null,
      target: data.uomType === "TIMELINE" ? null : data.target ?? null,
      deadline: data.deadline ? new Date(data.deadline) : null,
      weightage: data.weightage,
      ownerId: user.id,
      cycleId: cycle.id,
    },
  });

  await logAudit({
    actorId: user.id,
    goalId: goal.id,
    action: "CREATE",
    newValue: data.title,
  });

  return NextResponse.json({ ok: true, goal });
});
