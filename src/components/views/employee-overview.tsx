import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { currentQuarterForCycle } from "@/lib/scoring";
import { formatDate } from "@/lib/utils";
import {
  ArrowRight,
  Goal as GoalIcon,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Trophy,
} from "lucide-react";

export async function EmployeeOverview({ userId }: { userId: string }) {
  const me = await prisma.user.findUnique({ where: { id: userId } });
  const cycle = await prisma.cycle.findFirst({ where: { isActive: true } });
  const goals = await prisma.goal.findMany({
    where: { ownerId: userId, cycleId: cycle?.id },
    include: {
      thrustArea: true,
      checkIns: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const totalWeight = goals.reduce((s, g) => s + g.weightage, 0);
  const approvedGoals = goals.filter((g) => g.status === "APPROVED" || g.status === "LOCKED");
  const draftGoals = goals.filter((g) => g.status === "DRAFT");
  const submittedGoals = goals.filter((g) => g.status === "SUBMITTED");

  // Weighted score across approved goals
  let weightedScore = 0;
  let weightUsed = 0;
  for (const g of approvedGoals) {
    if (g.checkIns.length === 0) continue;
    const latest = g.checkIns.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
    weightedScore += (latest.score * g.weightage) / 100;
    weightUsed += g.weightage;
  }
  const overallScore = weightUsed > 0 ? (weightedScore / weightUsed) * 100 : 0;

  const q = currentQuarterForCycle(cycle);

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="chip mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {q ? `Current quarter · ${q}` : "Quarterly check-ins not open"}
          </div>
          <h1 className="display-heading text-4xl font-bold text-slate-900">
            Hello, {me?.name.split(" ")[0]}.
          </h1>
          <p className="text-slate-600 mt-2 text-[15px]">
            You have <strong className="text-slate-900">{goals.length}</strong> goals ·{" "}
            <strong className="text-slate-900">{approvedGoals.length}</strong> approved ·{" "}
            {totalWeight === 100 ? "weightage balanced" : `${100 - totalWeight}% unallocated`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/checkins">
              Log a check-in
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
          <Button asChild variant="brand">
            <Link href="/dashboard/goals/new">
              <Plus className="h-4 w-4" />
              New goal
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={GoalIcon}
          label="Total Goals"
          value={`${goals.length}/8`}
          hint={`${draftGoals.length} draft, ${submittedGoals.length} pending`}
        />
        <StatCard
          icon={Trophy}
          label="Approved"
          value={String(approvedGoals.length)}
          hint={approvedGoals.length > 0 ? "Goals are locked" : "Awaiting approval"}
          tone="emerald"
        />
        <StatCard
          icon={CheckCircle2}
          label="Total Weightage"
          value={`${totalWeight}%`}
          hint={totalWeight === 100 ? "Balanced ✓" : `${100 - totalWeight}% remaining`}
          tone={totalWeight === 100 ? "emerald" : totalWeight > 100 ? "rose" : "amber"}
        />
        <StatCard
          icon={Trophy}
          label="Weighted Score"
          value={`${Math.round(overallScore)}%`}
          hint="Across approved goals"
          tone={overallScore >= 75 ? "emerald" : overallScore >= 50 ? "amber" : "rose"}
        />
      </div>

      {/* Onboarding banner if no goals */}
      {goals.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <div className="h-12 w-12 rounded-full bg-brand-gradient/10 mx-auto grid place-items-center mb-3">
              <GoalIcon className="h-6 w-6 text-brand-gradient" />
            </div>
            <h3 className="font-semibold text-lg">Set up your first goal sheet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              Define between 1 and 8 goals with a total weightage of exactly 100% to submit for manager approval.
            </p>
            <Button asChild variant="brand" className="mt-4">
              <Link href="/dashboard/goals/new">
                <Plus className="h-4 w-4" />
                Create first goal
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Goals list */}
      {goals.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your goal sheet</CardTitle>
                <CardDescription>
                  All goals for the current cycle, with latest check-in scores.
                </CardDescription>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href="/dashboard/goals">View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {goals.map((g) => {
              const latest = g.checkIns.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
              return (
                <div
                  key={g.id}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-lg border border-border hover:bg-muted/40 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className="text-[10px]"
                        style={{ borderColor: g.thrustArea.color + "60", color: g.thrustArea.color }}
                      >
                        {g.thrustArea.name}
                      </Badge>
                      <StatusBadge status={g.status} />
                    </div>
                    <div className="font-medium mt-1 truncate">{g.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Target: {g.target ?? "—"}
                      {g.uomLabel ? ` ${g.uomLabel}` : ""}
                      {g.deadline ? ` by ${formatDate(g.deadline)}` : ""}
                      {" · "}Weight: <strong>{g.weightage}%</strong>
                      {latest && ` · Q-latest score: ${Math.round(latest.score)}%`}
                    </div>
                  </div>
                  <div className="md:w-48">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                      <span>Latest score</span>
                      <span>{latest ? `${Math.round(latest.score)}%` : "—"}</span>
                    </div>
                    <Progress value={latest?.score ?? 0} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { v: "secondary" | "success" | "warning" | "danger" | "info" | "brand"; label: string; icon?: React.ComponentType<{ className?: string }> }> = {
    DRAFT: { v: "secondary", label: "Draft" },
    SUBMITTED: { v: "warning", label: "Submitted", icon: Clock },
    APPROVED: { v: "success", label: "Approved", icon: CheckCircle2 },
    LOCKED: { v: "success", label: "Locked", icon: CheckCircle2 },
    RETURNED: { v: "danger", label: "Returned", icon: AlertTriangle },
  };
  const m = map[status] || map.DRAFT;
  const Icon = m.icon;
  return (
    <Badge variant={m.v} className="text-[10px] gap-1">
      {Icon && <Icon className="h-3 w-3" />}
      {m.label}
    </Badge>
  );
}
