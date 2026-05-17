import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { initials } from "@/lib/utils";
import { currentQuarter } from "@/lib/scoring";
import { Users, ChevronRight, Share2, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { ShareGoalButton } from "@/components/share-goal-button";

export default async function TeamPage() {
  const user = await requireUser();
  if (user.role !== "MANAGER" && user.role !== "ADMIN") return null;

  const team = await prisma.user.findMany({
    where: { managerId: user.id },
    include: {
      goals: { include: { checkIns: true } },
    },
  });

  const q = currentQuarter()!;

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Team</h1>
          <p className="text-muted-foreground mt-1">
            <Users className="h-4 w-4 inline mr-1" />
            {team.length} direct reports · current quarter <Badge variant="brand">{q}</Badge>
          </p>
        </div>
        <ShareGoalButton team={team.map((t) => ({ id: t.id, name: t.name }))} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Direct reports</CardTitle>
          <CardDescription>Click anyone to review their goal sheet and approve.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {team.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-8">
              No direct reports yet.
            </div>
          )}
          {team.map((t) => {
            const submitted = t.goals.filter((g) => g.status === "SUBMITTED").length;
            const approved = t.goals.filter((g) => g.status === "APPROVED" || g.status === "LOCKED").length;
            const draftCount = t.goals.filter((g) => g.status === "DRAFT").length;
            const qDone = t.goals.filter((g) => g.checkIns.some((c) => c.quarter === q)).length;
            const totalWeight = t.goals.reduce((s, g) => s + g.weightage, 0);
            return (
              <Link
                key={t.id}
                href={`/dashboard/team/${t.id}`}
                className="py-4 flex items-center gap-4 hover:bg-muted/40 -mx-6 px-6 transition-colors"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{initials(t.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{t.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {t.designation} · {t.department}
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-2">
                  {submitted > 0 && (
                    <Badge variant="warning"><Clock className="h-3 w-3 mr-1" />{submitted}</Badge>
                  )}
                  {approved > 0 && (
                    <Badge variant="success"><CheckCircle2 className="h-3 w-3 mr-1" />{approved}</Badge>
                  )}
                  {draftCount > 0 && <Badge variant="secondary">{draftCount} draft</Badge>}
                  {t.goals.length > 0 && totalWeight !== 100 && (
                    <Badge variant="danger"><AlertCircle className="h-3 w-3 mr-1" />{totalWeight}%</Badge>
                  )}
                </div>
                <div className="w-32 hidden lg:block">
                  <div className="text-[10px] text-muted-foreground mb-1">{q} check-in</div>
                  <Progress value={approved > 0 ? (qDone / approved) * 100 : 0} />
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
