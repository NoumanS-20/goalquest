import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { initials } from "@/lib/utils";
import { AnalyticsCharts } from "@/components/analytics-charts";
import { CompletionHeatmap } from "@/components/completion-heatmap";
import { QUARTERS } from "@/lib/scoring";

export default async function AnalyticsPage() {
  const user = await requireUser();
  if (user.role === "EMPLOYEE") return null;

  // Scope: ADMIN sees all, MANAGER sees their reports
  const userWhere = user.role === "MANAGER"
    ? { managerId: user.id }
    : { role: { in: ["EMPLOYEE", "MANAGER"] } };

  const cycle = await prisma.cycle.findFirst({ where: { isActive: true } });

  const users = await prisma.user.findMany({
    where: userWhere,
    include: {
      goals: {
        where: { cycleId: cycle?.id },
        include: { checkIns: true, thrustArea: true },
      },
    },
  });

  // QoQ average score per quarter
  const qoq = QUARTERS.map((q) => {
    const scores: number[] = [];
    for (const u of users) {
      for (const g of u.goals) {
        const c = g.checkIns.find((c) => c.quarter === q);
        if (c) scores.push(c.score);
      }
    }
    return {
      quarter: q,
      score: scores.length ? Math.round(scores.reduce((s, n) => s + n, 0) / scores.length) : 0,
    };
  });

  // Thrust area distribution
  const thrustAreas = await prisma.thrustArea.findMany();
  const thrustDist = thrustAreas.map((ta) => {
    const count = users.flatMap((u) => u.goals).filter((g) => g.thrustAreaId === ta.id).length;
    return { name: ta.name, value: count, color: ta.color };
  }).filter((t) => t.value > 0);

  // UoM distribution
  const uomCounts: Record<string, number> = {};
  for (const u of users) for (const g of u.goals) {
    uomCounts[g.uomType] = (uomCounts[g.uomType] || 0) + 1;
  }
  const uomDist = Object.entries(uomCounts).map(([k, v]) => ({ name: k, value: v }));

  // Status breakdown
  const statusCounts: Record<string, number> = { DRAFT: 0, SUBMITTED: 0, APPROVED: 0, LOCKED: 0, RETURNED: 0 };
  for (const u of users) for (const g of u.goals) {
    statusCounts[g.status] = (statusCounts[g.status] || 0) + 1;
  }
  const statusDist = Object.entries(statusCounts).map(([k, v]) => ({ name: k, value: v }));

  // Manager effectiveness (Admin only) — check-in completion rate per manager
  let mgrEffectiveness: { manager: string; completion: number; total: number }[] = [];
  if (user.role === "ADMIN") {
    const managers = await prisma.user.findMany({
      where: { role: "MANAGER" },
      include: { reports: { include: { goals: { where: { cycleId: cycle?.id }, include: { checkIns: true } } } } },
    });
    mgrEffectiveness = managers.map((m) => {
      const allGoals = m.reports.flatMap((r) => r.goals).filter((g) => g.status === "APPROVED" || g.status === "LOCKED");
      const allCheckins = allGoals.flatMap((g) => g.checkIns).length;
      const expected = allGoals.length * QUARTERS.length;
      return {
        manager: m.name,
        completion: expected > 0 ? Math.round((allCheckins / expected) * 100) : 0,
        total: allGoals.length,
      };
    });
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          {user.role === "ADMIN" ? "Organisation-wide" : "Team-level"} performance & coverage signals.
        </p>
      </div>

      <AnalyticsCharts qoq={qoq} thrustDist={thrustDist} uomDist={uomDist} statusDist={statusDist} />

      <CompletionHeatmap
        rows={users.map((u) => ({
          name: u.name,
          approvedCount: u.goals.filter((g) => g.status === "APPROVED" || g.status === "LOCKED").length,
          quarters: QUARTERS.map((q) => ({
            q,
            ratio: (() => {
              const approved = u.goals.filter((g) => g.status === "APPROVED" || g.status === "LOCKED");
              if (approved.length === 0) return 0;
              const done = approved.filter((g) => g.checkIns.some((c) => c.quarter === q)).length;
              return done / approved.length;
            })(),
          })),
        }))}
      />

      {user.role === "ADMIN" && mgrEffectiveness.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Manager effectiveness</CardTitle>
            <CardDescription>Aggregated check-in completion across all quarters for the team.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mgrEffectiveness.map((m) => (
                <div key={m.manager} className="flex items-center gap-3 p-2 rounded border border-border">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-[10px]">{initials(m.manager)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{m.manager}</div>
                    <div className="text-xs text-muted-foreground">{m.total} approved goal(s) in team</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${m.completion >= 75 ? "bg-emerald-500" : m.completion >= 50 ? "bg-amber-500" : "bg-rose-500"}`}
                        style={{ width: `${m.completion}%` }}
                      />
                    </div>
                    <Badge variant={m.completion >= 75 ? "success" : m.completion >= 50 ? "warning" : "danger"}>
                      {m.completion}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
