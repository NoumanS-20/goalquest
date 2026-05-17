import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Send, AlertCircle, CheckCircle2, Lock } from "lucide-react";
import { checkSubmitReady, MAX_GOALS } from "@/lib/validation";
import { GoalRow } from "@/components/goal-row";
import { SubmitButton } from "@/components/submit-button";

export default async function GoalsPage() {
  const user = await requireUser();
  const cycle = await prisma.cycle.findFirst({ where: { isActive: true } });
  const goals = await prisma.goal.findMany({
    where: { ownerId: user.id, cycleId: cycle?.id },
    include: { thrustArea: true, checkIns: true },
    orderBy: { createdAt: "asc" },
  });

  const totalWeight = goals.reduce((s, g) => s + g.weightage, 0);
  const draftOrReturned = goals.filter((g) => g.status === "DRAFT" || g.status === "RETURNED");
  const submitCheck = checkSubmitReady(goals);
  const canSubmit = submitCheck.ok && draftOrReturned.length > 0;
  const allLocked = goals.length > 0 && goals.every((g) => g.status === "APPROVED" || g.status === "LOCKED");

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="display-heading text-4xl font-bold text-slate-900">My Goal Sheet</h1>
          <p className="text-muted-foreground mt-1">
            {cycle?.name} · {goals.length}/{MAX_GOALS} goals · Total weight{" "}
            <strong className={totalWeight === 100 ? "text-emerald-600" : "text-amber-600"}>
              {totalWeight}%
            </strong>
          </p>
        </div>
        <div className="flex gap-2">
          {!allLocked && (
            <Button asChild variant={goals.length >= MAX_GOALS ? "outline" : "brand"} disabled={goals.length >= MAX_GOALS}>
              <Link href="/dashboard/goals/new">
                <Plus className="h-4 w-4" />
                New goal
              </Link>
            </Button>
          )}
          {draftOrReturned.length > 0 && (
            <SubmitButton disabled={!canSubmit} reason={submitCheck.reason} />
          )}
        </div>
      </div>

      {/* Weightage tracker */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Weightage budget</CardTitle>
            <span className={`font-mono text-sm ${totalWeight === 100 ? "text-emerald-600" : "text-amber-600"}`}>
              {totalWeight}% / 100%
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full transition-all ${totalWeight === 100 ? "bg-emerald-500" : totalWeight > 100 ? "bg-rose-500" : "bg-brand-gradient"}`}
              style={{ width: `${Math.min(100, totalWeight)}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-2 flex items-start gap-2">
            {submitCheck.ok ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5" />
                Ready to submit for approval.
              </>
            ) : (
              <>
                <AlertCircle className="h-3.5 w-3.5 text-amber-500 mt-0.5" />
                {submitCheck.reason}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {goals.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <h3 className="font-semibold">No goals yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Start by creating your first goal for the cycle.
            </p>
            <Button asChild variant="brand" className="mt-4">
              <Link href="/dashboard/goals/new">
                <Plus className="h-4 w-4" />
                Create goal
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Goals</CardTitle>
            <CardDescription>
              {allLocked ? (
                <span className="flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  All goals approved & locked. Contact your admin to make changes.
                </span>
              ) : (
                "Click any goal to edit, or delete it from the actions menu."
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {goals.map((g) => (
              <GoalRow key={g.id} goal={g} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
