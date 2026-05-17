import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Settings, Lock, FileSpreadsheet, RefreshCcw } from "lucide-react";
import { UnlockGoalButton } from "@/components/unlock-goal-button";

export default async function SettingsPage() {
  await requireRole("ADMIN");

  const lockedGoals = await prisma.goal.findMany({
    where: { status: { in: ["APPROVED", "LOCKED"] } },
    include: { owner: true, thrustArea: true },
    orderBy: { lockedAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          <Settings className="h-4 w-4 inline mr-1" />
          Admin-level overrides and configuration.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/dashboard/cycles" className="rounded-lg border border-border bg-card p-4 hover:border-brand/40">
          <RefreshCcw className="h-5 w-5 text-brand-gradient mb-2" />
          <div className="font-semibold">Cycle configuration</div>
          <div className="text-xs text-muted-foreground mt-1">Quarterly windows, escalation thresholds.</div>
        </Link>
        <Link href="/dashboard/reports" className="rounded-lg border border-border bg-card p-4 hover:border-brand/40">
          <FileSpreadsheet className="h-5 w-5 text-brand-gradient mb-2" />
          <div className="font-semibold">Reports & exports</div>
          <div className="text-xs text-muted-foreground mt-1">Achievement CSV, completion dashboard.</div>
        </Link>
        <Link href="/dashboard/escalations" className="rounded-lg border border-border bg-card p-4 hover:border-brand/40">
          <Lock className="h-5 w-5 text-brand-gradient mb-2" />
          <div className="font-semibold">Escalations</div>
          <div className="text-xs text-muted-foreground mt-1">Open & resolved alerts.</div>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Unlock locked goals</CardTitle>
          <CardDescription>
            For exception handling — re-opens an approved goal so the employee can edit. Every unlock is audit-logged.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {lockedGoals.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-6">No locked goals yet.</div>
          ) : (
            lockedGoals.map((g) => (
              <div key={g.id} className="flex items-center gap-3 p-3 rounded border border-border">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{g.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {g.owner.name} · <Badge variant="outline" className="text-[10px]" style={{ borderColor: g.thrustArea.color + "60", color: g.thrustArea.color }}>{g.thrustArea.name}</Badge>
                  </div>
                </div>
                <UnlockGoalButton goalId={g.id} title={g.title} />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
