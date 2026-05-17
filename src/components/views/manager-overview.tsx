import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { initials } from "@/lib/utils";
import {
  Users,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { currentQuarterForCycle } from "@/lib/scoring";

export async function ManagerOverview({ userId }: { userId: string }) {
  const me = await prisma.user.findUnique({ where: { id: userId } });
  const cycle = await prisma.cycle.findFirst({ where: { isActive: true } });
  const team = await prisma.user.findMany({
    where: { managerId: userId },
    include: {
      goals: { where: { cycleId: cycle?.id }, include: { checkIns: true } },
    },
  });

  const pendingApprovals = team.flatMap((t) => t.goals.filter((g) => g.status === "SUBMITTED")).length;
  const totalGoals = team.flatMap((t) => t.goals).length;
  const approvedGoals = team.flatMap((t) => t.goals.filter((g) => g.status === "APPROVED" || g.status === "LOCKED")).length;
  const q = currentQuarterForCycle(cycle);

  const teamCheckinComplete = q
    ? team.filter((t) => {
        const approved = t.goals.filter((g) => g.status === "APPROVED" || g.status === "LOCKED");
        if (approved.length === 0) return false;
        return approved.every((g) => g.checkIns.some((c) => c.quarter === q));
      }).length
    : 0;

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
            Managing <strong className="text-slate-900">{team.length}</strong> direct reports ·{" "}
            <strong className="text-slate-900">{pendingApprovals}</strong> awaiting approval
          </p>
        </div>
        <Button asChild variant="brand">
          <Link href="/dashboard/team">
            Manage team
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Direct Reports" value={String(team.length)} />
        <StatCard
          icon={Clock}
          label="Pending Approval"
          value={String(pendingApprovals)}
          tone={pendingApprovals > 0 ? "amber" : "emerald"}
          hint={pendingApprovals > 0 ? "Awaiting your review" : "All caught up"}
        />
        <StatCard
          icon={CheckCircle2}
          label="Goals Approved"
          value={`${approvedGoals}/${totalGoals}`}
          tone="emerald"
        />
        <StatCard
          icon={TrendingUp}
          label={q ? `${q} Check-ins Done` : "Check-ins Open"}
          value={q ? `${teamCheckinComplete}/${team.length}` : "Not open"}
          hint={q ? undefined : "Q1 opens from the cycle date"}
          tone={q && teamCheckinComplete === team.length ? "emerald" : "amber"}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team progress</CardTitle>
          <CardDescription>Goal-sheet completion and quarter status per direct report.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {team.map((t) => {
            const total = t.goals.length;
            const totalWeight = t.goals.reduce((s, g) => s + g.weightage, 0);
            const submitted = t.goals.filter((g) => g.status === "SUBMITTED").length;
            const approved = t.goals.filter((g) => g.status === "APPROVED" || g.status === "LOCKED").length;
            const draftCount = t.goals.filter((g) => g.status === "DRAFT").length;
            const qCheckIn = q ? t.goals.filter((g) => g.checkIns.some((c) => c.quarter === q)).length : 0;
            return (
              <div key={t.id} className="py-4 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar>
                    <AvatarFallback>{initials(t.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="font-medium truncate">{t.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {t.designation}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {submitted > 0 && <Badge variant="warning"><Clock className="h-3 w-3 mr-1" />{submitted} pending</Badge>}
                  {approved > 0 && <Badge variant="success">{approved} approved</Badge>}
                  {draftCount > 0 && <Badge variant="secondary">{draftCount} draft</Badge>}
                  {total === 0 && <Badge variant="danger"><AlertCircle className="h-3 w-3 mr-1" />No goals</Badge>}
                  {total > 0 && totalWeight !== 100 && (
                    <Badge variant="danger">Weight {totalWeight}%</Badge>
                  )}
                </div>
                <div className="md:w-48">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                    <span>{q ? `${q} check-in` : "Check-ins"}</span>
                    <span>{qCheckIn}/{approved}</span>
                  </div>
                  <Progress value={approved > 0 ? (qCheckIn / approved) * 100 : 0} />
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/dashboard/team/${t.id}`}>Open</Link>
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>
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
