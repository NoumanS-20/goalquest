import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { initials } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { CommentBox } from "@/components/comment-box";
import { ManagerGoalReview } from "@/components/manager-goal-review";
import { currentQuarterForCycle, QUARTERS, UOM_SHORT } from "@/lib/scoring";

export default async function TeamMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const cycle = await prisma.cycle.findFirst({ where: { isActive: true } });
  const member = await prisma.user.findUnique({
    where: { id },
    include: {
      goals: {
        where: { cycleId: cycle?.id },
        include: { thrustArea: true, checkIns: true, comments: { include: { author: true }, orderBy: { createdAt: "desc" } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!member) notFound();
  if (member.managerId !== user.id && user.role !== "ADMIN") redirect("/dashboard/team");

  const totalWeight = member.goals.reduce((s, g) => s + g.weightage, 0);
  const q = currentQuarterForCycle(cycle);

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <Link href="/dashboard/team" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to team
        </Link>
        <div className="flex items-center gap-4 mt-3">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="text-base">{initials(member.name)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="display-heading text-4xl font-bold text-slate-900">{member.name}</h1>
            <p className="text-muted-foreground text-sm">
              {member.designation} · {member.department} · {member.goals.length}/8 goals · Weight{" "}
              <strong className={totalWeight === 100 ? "text-emerald-600" : "text-amber-600"}>
                {totalWeight}%
              </strong>
            </p>
          </div>
        </div>
      </div>

      {member.goals.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            This employee hasn't created any goals yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {member.goals.map((g) => {
            const qChecks = QUARTERS.map((qu) => ({ qu, checkin: g.checkIns.find((c) => c.quarter === qu) }));
            const latest = [...g.checkIns].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

            return (
              <Card key={g.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge variant="outline" className="text-[10px]" style={{ borderColor: g.thrustArea.color + "60", color: g.thrustArea.color }}>
                          {g.thrustArea.name}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">{UOM_SHORT[g.uomType]}</Badge>
                        <StatusBadge status={g.status} />
                        <Badge variant="secondary" className="text-[10px]">{g.weightage}%</Badge>
                      </div>
                      <CardTitle className="text-lg">{g.title}</CardTitle>
                      {g.description && (
                        <CardDescription className="mt-1">{g.description}</CardDescription>
                      )}
                      <div className="text-xs text-muted-foreground mt-2">
                        Target: <strong className="text-foreground">{g.target ?? "—"}{g.uomLabel ? ` ${g.uomLabel}` : ""}</strong>
                        {g.deadline && <> · Deadline: <strong className="text-foreground">{new Date(g.deadline).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</strong></>}
                      </div>
                    </div>
                    <div className="w-44">
                      <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                        <span>Latest score</span>
                        <span className="font-mono">{latest ? `${Math.round(latest.score)}%` : "—"}</span>
                      </div>
                      <Progress value={latest?.score ?? 0} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Quarter grid */}
                  <div className="grid grid-cols-4 gap-2">
                    {qChecks.map(({ qu, checkin }) => (
                      <div
                        key={qu}
                        className={`p-2.5 rounded-md border text-center ${
                          qu === q ? "border-brand/40 bg-brand-gradient/5" : "border-border"
                        }`}
                      >
                        <div className="text-[10px] uppercase font-semibold text-muted-foreground">
                          {qu}{qu === q && " (now)"}
                        </div>
                        <div className="mt-1 font-mono text-sm">
                          {checkin?.actualValue != null ? checkin.actualValue : checkin?.actualDate ? new Date(checkin.actualDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—"}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {checkin ? `${Math.round(checkin.score)}%` : "no check-in"}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Approve / return for SUBMITTED */}
                  {g.status === "SUBMITTED" && (
                    <ManagerGoalReview
                      goal={{
                        id: g.id,
                        uomType: g.uomType,
                        target: g.target,
                        deadline: g.deadline?.toISOString() ?? null,
                        weightage: g.weightage,
                      }}
                    />
                  )}

                  {/* Comments */}
                  {q ? (
                    <CommentBox goalId={g.id} quarter={q} existing={g.comments} />
                  ) : (
                    <div className="border-t border-border pt-3 text-xs text-muted-foreground">
                      Check-in comments open with the Q1 achievement window.
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { v: "secondary" | "success" | "warning" | "danger"; label: string }> = {
    DRAFT: { v: "secondary", label: "Draft" },
    SUBMITTED: { v: "warning", label: "Submitted" },
    APPROVED: { v: "success", label: "Approved" },
    LOCKED: { v: "success", label: "Locked" },
    RETURNED: { v: "danger", label: "Returned" },
  };
  const m = map[status] || map.DRAFT;
  return <Badge variant={m.v} className="text-[10px]">{m.label}</Badge>;
}
