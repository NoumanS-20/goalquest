import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth, readJson } from "@/lib/api";
import { goalSchema } from "@/lib/validation";
import { logAudit } from "@/lib/audit";

export const PATCH = withAuth<{ id: string }>(async ({ user, req, params }) => {
  const { id } = params;
  const goal = await prisma.goal.findUnique({
    where: { id },
    include: { cycle: true },
  });
  if (!goal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = goal.ownerId === user.id;
  const isAdmin = user.role === "ADMIN";
  const isManagerOfOwner = !isOwner && !isAdmin && user.role === "MANAGER"
    ? await prisma.user.findFirst({ where: { id: goal.ownerId, managerId: user.id } })
    : null;

  if (!isOwner && !isManagerOfOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await readJson<Record<string, unknown>>(req);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = goalSchema.partial().safeParse({
    ...body,
    target: body.target != null && body.target !== "" ? Number(body.target) : undefined,
    weightage: body.weightage != null ? Number(body.weightage) : undefined,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const requestedFields = Object.keys(data).filter(
    (key) => data[key as keyof typeof data] !== undefined,
  );

  // Shared-goal recipients can only edit their own weightage
  if (goal.isShared && goal.parentGoalId && isOwner && !isAdmin) {
    if (requestedFields.some((field) => field !== "weightage") || data.weightage == null) {
      return NextResponse.json(
        { error: "Shared goal recipients can only adjust weightage." },
        { status: 400 },
      );
    }
    await prisma.$transaction([
      prisma.goal.update({ where: { id }, data: { weightage: data.weightage } }),
      prisma.sharedGoal.updateMany({
        where: { goalId: goal.parentGoalId, recipientId: user.id },
        data: { weightage: data.weightage },
      }),
    ]);
    await logAudit({
      actorId: user.id,
      goalId: id,
      action: "UPDATE",
      field: "weightage",
      oldValue: goal.weightage,
      newValue: data.weightage,
    });
    return NextResponse.json({ ok: true });
  }

  if (isOwner && !isAdmin && !["DRAFT", "RETURNED"].includes(goal.status)) {
    return NextResponse.json(
      { error: "Goal is locked. Ask Admin to unlock." },
      { status: 400 },
    );
  }
  if (isManagerOfOwner && !isAdmin && goal.status !== "SUBMITTED") {
    return NextResponse.json(
      { error: "Managers can edit only submitted goals during approval." },
      { status: 400 },
    );
  }
  if (new Date() < goal.cycle.goalSetOpen) {
    return NextResponse.json(
      { error: `Goal setting opens on ${goal.cycle.goalSetOpen.toLocaleDateString("en-IN")}.` },
      { status: 400 },
    );
  }

  const fieldsToCheck = ["title", "description", "weightage", "target", "uomType", "uomLabel", "deadline"] as const;
  for (const f of fieldsToCheck) {
    if (data[f] != null && data[f] !== (goal as Record<string, unknown>)[f]) {
      await logAudit({
        actorId: user.id,
        goalId: id,
        action: "UPDATE",
        field: f,
        oldValue: (goal as Record<string, unknown>)[f] as string | number,
        newValue: data[f] as string | number,
      });
    }
  }

  const updated = await prisma.goal.update({
    where: { id },
    data: {
      ...(data.title != null && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.thrustAreaId != null && { thrustAreaId: data.thrustAreaId }),
      ...(data.uomType != null && { uomType: data.uomType }),
      ...(data.uomLabel !== undefined && { uomLabel: data.uomLabel }),
      ...(data.target !== undefined && { target: data.target }),
      ...(data.deadline !== undefined && {
        deadline: data.deadline ? new Date(data.deadline) : null,
      }),
      ...(data.weightage != null && { weightage: data.weightage }),
    },
  });

  return NextResponse.json({ ok: true, goal: updated });
});

export const DELETE = withAuth<{ id: string }>(async ({ user, params }) => {
  const { id } = params;
  const goal = await prisma.goal.findUnique({ where: { id } });
  if (!goal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = goal.ownerId === user.id;
  const isAdmin = user.role === "ADMIN";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (isOwner && !isAdmin && !["DRAFT", "RETURNED"].includes(goal.status)) {
    return NextResponse.json({ error: "Cannot delete locked goals." }, { status: 400 });
  }

  await prisma.goal.delete({ where: { id } });
  await logAudit({ actorId: user.id, action: "DELETE", oldValue: goal.title });
  return NextResponse.json({ ok: true });
});
