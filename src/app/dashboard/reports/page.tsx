import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { initials } from "@/lib/utils";
import { FileSpreadsheet, Download } from "lucide-react";
import { QUARTERS, currentQuarterForCycle } from "@/lib/scoring";

export default async function ReportsPage() {
  await requireRole("ADMIN");
  const cycle = await prisma.cycle.findFirst({ where: { isActive: true } });
  const users = await prisma.user.findMany({
    where: { role: { in: ["EMPLOYEE", "MANAGER"] } },
    include: {
      goals: { where: { cycleId: cycle?.id }, include: { checkIns: true } },
    },
    orderBy: { name: "asc" },
  });

  const q = currentQuarterForCycle(cycle);

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="display-heading text-4xl font-bold text-slate-900">Reports</h1>
          <p className="text-muted-foreground mt-1">
            <FileSpreadsheet className="h-4 w-4 inline mr-1" />
            Achievement Report &amp; Completion Dashboard — exportable.
          </p>
        </div>
        <Button asChild variant="brand">
          <a href="/api/reports/achievement.csv">
            <Download className="h-4 w-4" />
            Download Achievement CSV
          </a>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Completion Dashboard</CardTitle>
          <CardDescription>
            Real-time view of who's submitted goals, who's approved them, and quarterly check-in coverage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-xs uppercase text-muted-foreground">
                <tr className="text-left">
                  <th className="px-6 py-2 font-medium">User</th>
                  <th className="px-3 py-2 font-medium">Goals</th>
                  <th className="px-3 py-2 font-medium">Weight</th>
                  {QUARTERS.map((qu) => (
                    <th key={qu} className={`px-3 py-2 font-medium ${qu === q ? "text-brand-gradient" : ""}`}>{qu}</th>
                  ))}
                  <th className="px-3 py-2 font-medium">Overall</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const total = u.goals.length;
                  const approved = u.goals.filter((g) => g.status === "APPROVED" || g.status === "LOCKED").length;
                  const totalWeight = u.goals.reduce((s, g) => s + g.weightage, 0);
                  const qStatus: Record<string, number> = {};
                  for (const qu of QUARTERS) {
                    const done = u.goals.filter((g) => g.checkIns.some((c) => c.quarter === qu)).length;
                    qStatus[qu] = approved > 0 ? (done / approved) * 100 : 0;
                  }
                  let weightedScore = 0;
                  let wUsed = 0;
                  for (const g of u.goals) {
                    if (g.status !== "APPROVED" && g.status !== "LOCKED") continue;
                    const latest = [...g.checkIns].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
                    if (latest) {
                      weightedScore += latest.score * g.weightage / 100;
                      wUsed += g.weightage;
                    }
                  }
                  const overall = wUsed > 0 ? (weightedScore / wUsed) * 100 : 0;
                  return (
                    <tr key={u.id} className="border-b border-border hover:bg-muted/40">
                      <td className="px-6 py-2.5">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="text-[10px]">{initials(u.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm">{u.name}</div>
                            <div className="text-[10px] text-muted-foreground">{u.designation}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge variant={total === 0 ? "danger" : approved === total ? "success" : "warning"}>
                          {approved}/{total}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`font-mono text-xs ${totalWeight === 100 ? "text-emerald-600" : totalWeight === 0 ? "text-muted-foreground" : "text-amber-600"}`}>
                          {totalWeight}%
                        </span>
                      </td>
                      {QUARTERS.map((qu) => (
                        <td key={qu} className="px-3 py-2.5">
                          <div className="w-16">
                            <Progress value={qStatus[qu]} />
                          </div>
                        </td>
                      ))}
                      <td className="px-3 py-2.5">
                        <span className={`font-mono text-sm font-medium ${overall >= 75 ? "text-emerald-600" : overall >= 50 ? "text-amber-600" : "text-rose-600"}`}>
                          {wUsed > 0 ? `${Math.round(overall)}%` : "—"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
