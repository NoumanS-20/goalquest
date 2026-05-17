import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withRole } from "@/lib/api";
import { logAudit } from "@/lib/audit";

export const POST = withRole<{ id: string }>("ADMIN", async ({ user, params }) => {
  const { id } = params;
  const goal = await prisma.goal.findUnique({ where: { id } });
  if (!goal) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.goal.update({
    where: { id },
    data: { status: "DRAFT", lockedAt: null, approvedAt: null },
  });
  await logAudit({
    actorId: user.id,
    goalId: id,
    action: "UNLOCK",
    oldValue: goal.status,
    newValue: "DRAFT",
  });
  return NextResponse.json({ ok: true });
});
