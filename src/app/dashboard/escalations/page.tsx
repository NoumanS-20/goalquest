import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";
import { Bell, ShieldCheck } from "lucide-react";
import { ResolveButton } from "@/components/resolve-button";
import { RunEscalationsButton } from "@/components/run-escalations-button";

export default async function EscalationsPage() {
  await requireRole("ADMIN");
  const escalations = await prisma.escalation.findMany({
    orderBy: [{ resolved: "asc" }, { createdAt: "desc" }],
    include: { target: true },
    take: 100,
  });

  const open = escalations.filter((e) => !e.resolved);
  const closed = escalations.filter((e) => e.resolved);

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Escalations</h1>
          <p className="text-muted-foreground mt-1">
            Rule-based alerts when goals or check-ins miss configured thresholds.
          </p>
        </div>
        <RunEscalationsButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Open ({open.length})</CardTitle>
          <CardDescription>Awaiting acknowledgement.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {open.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8 flex items-center justify-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              No open escalations — everything's healthy.
            </div>
          ) : (
            open.map((e) => (
              <div key={e.id} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-amber-50/30 dark:bg-amber-950/10">
                <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/40 grid place-items-center flex-shrink-0">
                  <Bell className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="warning">{ruleLabel(e.ruleType)}</Badge>
                    <Badge variant="outline" className="text-[10px]">Level {e.level}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {e.createdAt.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="text-sm mt-1">{e.message}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-[8px]">{initials(e.target.name)}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">{e.target.name}</span>
                  </div>
                </div>
                <ResolveButton id={e.id} />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {closed.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">Resolved ({closed.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {closed.slice(0, 10).map((e) => (
              <div key={e.id} className="text-xs text-muted-foreground p-2 rounded border border-border/60 flex items-center gap-2 line-through opacity-70">
                <Badge variant="success" className="text-[9px]">{ruleLabel(e.ruleType)}</Badge>
                {e.message}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ruleLabel(r: string) {
  if (r === "SUBMIT") return "Submission";
  if (r === "APPROVE") return "Approval";
  return "Check-in";
}
