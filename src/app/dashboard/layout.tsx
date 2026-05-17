import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { AppShell } from "@/components/app-shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const accounts = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, department: true },
    orderBy: { role: "asc" },
  });

  // Manager: pending approvals badge
  let pendingCount = 0;
  if (user.role === "MANAGER") {
    pendingCount = await prisma.goal.count({
      where: { owner: { managerId: user.id }, status: "SUBMITTED" },
    });
  } else if (user.role === "ADMIN") {
    pendingCount = await prisma.escalation.count({ where: { resolved: false } });
  }

  return (
    <AppShell
      user={{ id: user.id, name: user.name, email: user.email, role: user.role, department: user.department }}
      accounts={accounts}
      pendingCount={pendingCount}
    >
      {children}
    </AppShell>
  );
}
