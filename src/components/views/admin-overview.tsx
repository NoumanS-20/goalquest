import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Goal as GoalIcon,
  ShieldAlert,
  TrendingUp,
  ArrowRight,
  Building2,
  Activity,
} from "lucide-react";
import { currentQuarter } from "@/lib/scoring";

export async function AdminOverview() {
  const [
    userCount,
    employeeCount,
    managerCount,
    goalCount,
    approvedCount,
    submittedCount,
    escalations,
    cycle,
    recentAudits,
    thrustBreakdown,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "EMPLOYEE" } }),
    prisma.user.count({ where: { role: "MANAGER" } }),
    prisma.goal.count(),
    prisma.goal.count({ where: { status: { in: ["APPROVED", "LOCKED"] } } }),
    prisma.goal.count({ where: { status: "SUBMITTED" } }),
    prisma.escalation.count({ where: { resolved: false } }),
    prisma.cycle.findFirst({ where: { isActive: true } }),
    prisma.auditLog.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { actor: true, goal: true },
    }),
    prisma.goal.groupBy({
      by: ["thrustAreaId"],
      _count: true,
    }),
  ]);

  const thrustAreas = await prisma.thrustArea.findMany();
  const q = currentQuarter()!;

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="chip mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {cycle?.name ?? "No active cycle"} · {q}
          </div>
          <h1 className="display-heading text-4xl font-bold text-slate-900">
            Admin overview.
          </h1>
          <p className="text-slate-600 mt-2 text-[15px]">
            <strong className="text-slate-900">{userCount}</strong> people ·{" "}
            <strong className="text-slate-900">{goalCount}</strong> goals ·{" "}
            <strong className="text-slate-900">{escalations}</strong> open escalations
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/reports">Export reports</Link>
          </Button>
          <Button asChild variant="brand">
            <Link href="/dashboard/cycles">Manage cycles</Link>
          </Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Users"
          value={String(userCount)}
          hint={`${employeeCount} employees · ${managerCount} managers`}
        />
        <StatCard
          icon={GoalIcon}
          label="Goals This Cycle"
          value={String(goalCount)}
          hint={`${approvedCount} approved · ${submittedCount} pending`}
          tone="emerald"
        />
        <StatCard
          icon={ShieldAlert}
          label="Open Escalations"
          value={String(escalations)}
          tone={escalations > 0 ? "amber" : "emerald"}
          hint={escalations > 0 ? "Needs attention" : "All clear"}
        />
        <StatCard
          icon={TrendingUp}
          label="Approval Rate"
          value={`${goalCount > 0 ? Math.round((approvedCount / goalCount) * 100) : 0}%`}
          tone="emerald"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Activity feed</CardTitle>
                <CardDescription>Most recent changes across all goal sheets.</CardDescription>
              </div>
              <Button asChild size="sm" variant="ghost">
                <Link href="/dashboard/audit">
                  Full log <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentAudits.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-8">No activity yet.</div>
            ) : (
              <div className="space-y-3">
                {recentAudits.map((a) => (
                  <div key={a.id} className="flex items-start gap-3 text-sm">
                    <div className="h-7 w-7 rounded-full bg-brand-gradient/10 grid place-items-center mt-0.5 flex-shrink-0">
                      <Activity className="h-3.5 w-3.5 text-brand-gradient" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium">{a.actor.name}</span>{" "}
                      <span className="text-muted-foreground">
                        {prettyAction(a.action)}
                        {a.goal && (
                          <>
                            {" "}
                            <span className="text-foreground font-medium">"{a.goal.title}"</span>
                          </>
                        )}
                        {a.field && <> · {a.field}</>}
                      </span>
                      <div className="text-xs text-muted-foreground/70">
                        {a.createdAt.toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thrust Areas</CardTitle>
            <CardDescription>Goal distribution.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {thrustAreas.map((ta) => {
              const count = thrustBreakdown.find((t) => t.thrustAreaId === ta.id)?._count ?? 0;
              const pct = goalCount > 0 ? (count / goalCount) * 100 : 0;
              return (
                <div key={ta.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: ta.color }}
                      />
                      {ta.name}
                    </span>
                    <span className="font-mono">{count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: ta.color }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {quickLinks.map((q) => (
          <Link
            key={q.href}
            href={q.href}
            className="group rounded-xl border border-border bg-card p-5 hover:border-brand/40 hover:shadow-sm transition-all"
          >
            <q.icon className="h-5 w-5 text-brand-gradient mb-3" />
            <div className="font-semibold">{q.title}</div>
            <div className="text-xs text-muted-foreground mt-1">{q.desc}</div>
            <div className="text-xs mt-3 flex items-center gap-1 text-brand-gradient opacity-0 group-hover:opacity-100 transition-opacity">
              Open <ArrowRight className="h-3 w-3" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

const quickLinks = [
  { href: "/dashboard/org", title: "Organization", desc: "Manage users, departments and reporting lines.", icon: Building2 },
  { href: "/dashboard/cycles", title: "Goal Cycles", desc: "Configure FY cycle dates and quarterly windows.", icon: GoalIcon },
  { href: "/dashboard/escalations", title: "Escalations", desc: "Review rule-based escalations and ack.", icon: ShieldAlert },
];

function prettyAction(action: string) {
  switch (action) {
    case "CREATE": return "created";
    case "UPDATE": return "updated";
    case "APPROVE": return "approved";
    case "RETURN": return "returned for rework";
    case "LOCK": return "locked";
    case "UNLOCK": return "unlocked";
    case "CHECKIN": return "logged check-in for";
    case "DELETE": return "deleted";
    default: return action.toLowerCase();
  }
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "neutral",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint?: string;
  tone?: "neutral" | "emerald" | "amber" | "rose";
}) {
  const toneCls = {
    neutral: "text-foreground",
    emerald: "text-emerald-600 dark:text-emerald-400",
    amber: "text-amber-600 dark:text-amber-400",
    rose: "text-rose-600 dark:text-rose-400",
  }[tone];

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground font-medium">{label}</div>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className={`text-3xl font-bold mt-2 ${toneCls}`}>{value}</div>
        {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
      </CardContent>
    </Card>
  );
}
