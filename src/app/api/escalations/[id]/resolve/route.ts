import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withRole } from "@/lib/api";

export const POST = withRole<{ id: string }>("ADMIN", async ({ params }) => {
  const { id } = params;
  await prisma.escalation.update({
    where: { id },
    data: { resolved: true, resolvedAt: new Date() },
  });
  return NextResponse.json({ ok: true });
});
