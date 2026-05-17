import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { currentQuarter, QUARTERS } from "@/lib/scoring";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckinForm } from "@/components/checkin-form";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default async function CheckinsPage() {
  const user = await requireUser();
  const cycle = await prisma.cycle.findFirst({ where: { isActive: true } });
  const goals = await prisma.goal.findMany({
    where: {
      ownerId: user.id,
      cycleId: cycle?.id,
      status: { in: ["APPROVED", "LOCKED"] },
    },
    include: { thrustArea: true, checkIns: true },
    orderBy: { createdAt: "asc" },
  });

  const q = currentQuarter()!;

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="display-heading text-4xl font-bold text-slate-900">Quarterly Check-ins</h1>
        <p className="text-muted-foreground mt-1">
          Log actual achievement against planned targets. Current quarter:{" "}
          <Badge variant="brand">{q}</Badge>
        </p>
      </div>

      {goals.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <h3 className="font-semibold">No approved goals yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Once your manager approves your goals, you'll be able to log check-ins here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue={q}>
          <TabsList>
            {QUARTERS.map((qu) => (
              <TabsTrigger key={qu} value={qu}>
                {qu}
                {qu === q && <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-brand-gradient" />}
              </TabsTrigger>
            ))}
          </TabsList>

          {QUARTERS.map((qu) => (
            <TabsContent key={qu} value={qu} className="space-y-3">
              <Card>
                <CardHeader>
                  <CardTitle>{qu} Check-in</CardTitle>
                  <CardDescription>
                    Update achievement for the {qu} period. Scores are computed automatically.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {goals.map((g) => {
                    const existing = g.checkIns.find((c) => c.quarter === qu);
                    return (
                      <CheckinForm
                        key={g.id}
                        goal={{
                          id: g.id,
                          title: g.title,
                          uomType: g.uomType,
                          uomLabel: g.uomLabel,
                          target: g.target,
                          deadline: g.deadline?.toISOString() ?? null,
                          progressStatus: g.progressStatus,
                          thrustArea: g.thrustArea,
                        }}
                        quarter={qu}
                        existing={
                          existing
                            ? {
                                actualValue: existing.actualValue,
                                actualDate: existing.actualDate?.toISOString() ?? null,
                                notes: existing.notes,
                                score: existing.score,
                              }
                            : null
                        }
                      />
                    );
                  })}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
