import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth, readJson } from "@/lib/api";

type CommentBody = { goalId?: string; quarter?: string; comment?: string };

export const POST = withAuth(async ({ user, req }) => {
  const body = await readJson<CommentBody>(req);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { goalId, quarter, comment } = body;
  if (!goalId || !quarter || !comment?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Authorisation: actor must be owner, owner's manager, or admin
  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
    select: { ownerId: true, owner: { select: { managerId: true } } },
  });
  if (!goal) return NextResponse.json({ error: "Goal not found" }, { status: 404 });

  const isOwner = goal.ownerId === user.id;
  const isManager = goal.owner.managerId === user.id && user.role === "MANAGER";
  const isAdmin = user.role === "ADMIN";
  if (!isOwner && !isManager && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.checkInComment.create({
    data: {
      goalId,
      authorId: user.id,
      quarter,
      comment: comment.trim().slice(0, 2000),
    },
  });
  return NextResponse.json({ ok: true });
});
