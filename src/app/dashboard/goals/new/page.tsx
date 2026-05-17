import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { GoalForm } from "@/components/goal-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MAX_GOALS } from "@/lib/validation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function NewGoalPage() {
  const user = await requireUser();
  const cycle = await prisma.cycle.findFirst({ where: { isActive: true } });
  if (!cycle) redirect("/dashboard/goals");

  const [thrustAreas, existing] = await Promise.all([
    prisma.thrustArea.findMany({ orderBy: { name: "asc" } }),
    prisma.goal.findMany({ where: { ownerId: user.id, cycleId: cycle.id } }),
  ]);

  const totalUsed = existing.reduce((s, g) => s + g.weightage, 0);
  const remaining = Math.max(0, 100 - totalUsed);

  if (existing.length >= MAX_GOALS) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Goal limit reached</CardTitle>
          <CardDescription>
            You've hit the {MAX_GOALS}-goal maximum for this cycle.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline"><Link href="/dashboard/goals"><ArrowLeft className="h-4 w-4" />Back</Link></Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-fade-up">
      <div>
        <Link href="/dashboard/goals" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to goals
        </Link>
        <h1 className="display-heading text-4xl font-bold text-slate-900 mt-2">Create a new goal</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {existing.length}/{MAX_GOALS} goals used · {remaining}% weightage remaining
        </p>
      </div>
      <GoalForm thrustAreas={thrustAreas} remainingWeight={remaining} />
    </div>
  );
}
