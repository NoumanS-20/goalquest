import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";

export async function POST(req: Request) {
  const user = await requireUser();
  const { goalId, quarter, comment } = await req.json();
  if (!goalId || !quarter || !comment?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  await prisma.checkInComment.create({
    data: { goalId, authorId: user.id, quarter, comment: comment.trim() },
  });
  return NextResponse.json({ ok: true });
}
