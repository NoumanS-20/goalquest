import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withRole, readJson } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { checkSubmitReady } from "@/lib/validation";

export const POST = withRole<{ id: string }>(
  ["MANAGER", "ADMIN"],
  async ({ user, req, params }) => {
    const { id } = params;
    const body = await readJson<{ action?: string; note?: string }>(req);
    const action = body?.action;
    const note = body?.note;

    const goal = await prisma.goal.findUnique({
      where: { id },
      include: { owner: true },
    });
    if (!goal) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Managers can only act on their direct reports' goals
    if (user.role === "MANAGER" && goal.owner.managerId !== user.id) {
      return NextResponse.json({ error: "Not your direct report" }, { status: 403 });
    }
    if (goal.status !== "SUBMITTED") {
      return NextResponse.json(
        { error: "Only submitted goals can be approved or returned." },
        { status: 400 },
      );
    }

    if (action === "approve") {
      const sheet = await prisma.goal.findMany({
        where: { ownerId: goal.ownerId, cycleId: goal.cycleId },
      });
      const check = checkSubmitReady(sheet);
      if (!check.ok) {
        return NextResponse.json(
          { error: `Cannot approve until the goal sheet is valid: ${check.reason}` },
          { status: 400 },
        );
      }

      await prisma.goal.update({
        where: { id },
        data: {
          status: "APPROVED",
          approvedAt: new Date(),
          lockedAt: new Date(),
          managerNote: note || null,
        },
      });
      await logAudit({
        actorId: user.id,
        goalId: id,
        action: "APPROVE",
        newValue: note || "Approved",
      });
    } else if (action === "return") {
      await prisma.goal.update({
        where: { id },
        data: { status: "RETURNED", managerNote: note || null },
      });
      await logAudit({
        actorId: user.id,
        goalId: id,
        action: "RETURN",
        newValue: note || "Returned",
      });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  },
);
