import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!["MANAGER", "ADMIN"].includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await ctx.params;
  const { action, note } = await req.json().catch(() => ({}));

  const goal = await prisma.goal.findUnique({ where: { id }, include: { owner: true } });
  if (!goal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (user.role === "MANAGER" && goal.owner.managerId !== user.id) {
    return NextResponse.json({ error: "Not your direct report" }, { status: 403 });
  }

  if (action === "approve") {
    await prisma.goal.update({
      where: { id },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
        lockedAt: new Date(),
        managerNote: note || null,
      },
    });
    await logAudit({ actorId: user.id, goalId: id, action: "APPROVE", newValue: note || "Approved" });
  } else if (action === "return") {
    await prisma.goal.update({
      where: { id },
      data: { status: "RETURNED", managerNote: note || null },
    });
    await logAudit({ actorId: user.id, goalId: id, action: "RETURN", newValue: note || "Returned" });
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
