import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { CycleEditor } from "@/components/cycle-editor";
import { RefreshCcw, Calendar } from "lucide-react";

export default async function CyclesPage() {
  await requireRole("ADMIN");
  const cycles = await prisma.cycle.findMany({
    orderBy: { startDate: "desc" },
    include: { _count: { select: { goals: true } } },
  });

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Goal Cycles</h1>
        <p className="text-muted-foreground mt-1">
          Configure cycle dates and quarterly windows.
        </p>
      </div>

      <div className="space-y-4">
        {cycles.map((c) => (
          <Card key={c.id}>
            <CardHeader>
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-brand-gradient" />
                    {c.name}
                    {c.isActive && <Badge variant="brand">Active</Badge>}
                  </CardTitle>
                  <CardDescription>
                    {formatDate(c.startDate)} → {formatDate(c.endDate)} · {c._count.goals} goals
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CycleEditor
                cycle={{
                  id: c.id,
                  goalSetOpen: c.goalSetOpen.toISOString().slice(0, 10),
                  q1Open: c.q1Open.toISOString().slice(0, 10),
                  q2Open: c.q2Open.toISOString().slice(0, 10),
                  q3Open: c.q3Open.toISOString().slice(0, 10),
                  q4Open: c.q4Open.toISOString().slice(0, 10),
                  escSubmitDays: c.escSubmitDays,
                  escApproveDays: c.escApproveDays,
                  escCheckinDays: c.escCheckinDays,
                }}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
