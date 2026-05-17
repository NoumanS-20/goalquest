import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { notFound, redirect } from "next/navigation";
import { GoalForm } from "@/components/goal-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditGoalPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const goal = await prisma.goal.findUnique({
    where: { id },
    include: { thrustArea: true },
  });
  if (!goal) notFound();
  if (goal.ownerId !== user.id && user.role !== "ADMIN") redirect("/dashboard/goals");
  if (goal.status === "APPROVED" || goal.status === "LOCKED") {
    if (user.role !== "ADMIN") redirect("/dashboard/goals");
  }

  const cycle = await prisma.cycle.findFirst({ where: { isActive: true } });
  const [thrustAreas, existing] = await Promise.all([
    prisma.thrustArea.findMany({ orderBy: { name: "asc" } }),
    prisma.goal.findMany({ where: { ownerId: goal.ownerId, cycleId: cycle?.id } }),
  ]);
  const otherWeight = existing.filter((g) => g.id !== goal.id).reduce((s, g) => s + g.weightage, 0);
  const remaining = Math.max(0, 100 - otherWeight);

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-fade-up">
      <div>
        <Link href="/dashboard/goals" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to goals
        </Link>
        <h1 className="text-3xl font-bold tracking-tight mt-2">Edit goal</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          You have up to {remaining}% weightage available for this goal.
        </p>
      </div>
      <GoalForm
        thrustAreas={thrustAreas}
        remainingWeight={remaining}
        initial={{
          id: goal.id,
          title: goal.title,
          description: goal.description,
          thrustAreaId: goal.thrustAreaId,
          uomType: goal.uomType,
          uomLabel: goal.uomLabel,
          target: goal.target,
          deadline: goal.deadline ? goal.deadline.toISOString().slice(0, 10) : null,
          weightage: goal.weightage,
        }}
      />
    </div>
  );
}
