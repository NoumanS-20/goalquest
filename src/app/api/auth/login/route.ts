import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession, destroySession, verifyPassword } from "@/lib/session";

export async function POST(req: Request) {
  const { email, password } = await req.json().catch(() => ({}));
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { email: String(email).toLowerCase() } });
  if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  const ok = await verifyPassword(password, user.password);
  if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  await destroySession();
  await createSession(user.id);
  return NextResponse.json({ ok: true, user: { id: user.id, role: user.role, name: user.name } });
}
