import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { initials } from "@/lib/utils";
import { History, Activity } from "lucide-react";

export default async function AuditPage() {
  const user = await requireUser();

  let where = {};
  if (user.role === "EMPLOYEE") {
    where = { OR: [{ actorId: user.id }, { goal: { ownerId: user.id } }] };
  } else if (user.role === "MANAGER") {
    where = {
      OR: [
        { actorId: user.id },
        { goal: { owner: { managerId: user.id } } },
      ],
    };
  }

  const audits = await prisma.auditLog.findMany({
    where,
    include: { actor: true, goal: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Trail</h1>
        <p className="text-muted-foreground mt-1">
          <History className="h-4 w-4 inline mr-1" />
          Every change to a goal — including post-lock edits — is captured here.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity log</CardTitle>
          <CardDescription>Showing latest {audits.length} entries.</CardDescription>
        </CardHeader>
        <CardContent>
          {audits.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">No activity yet.</div>
          ) : (
            <div className="divide-y divide-border -mx-6">
              {audits.map((a) => (
                <div key={a.id} className="px-6 py-3 flex items-start gap-3 hover:bg-muted/30">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="text-[10px]">{initials(a.actor.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm">
                      <span className="font-medium">{a.actor.name}</span>{" "}
                      <Badge variant={actionVariant(a.action)} className="text-[10px] mx-1">{a.action}</Badge>
                      {a.field && <span className="text-muted-foreground"> · field <code className="text-xs">{a.field}</code></span>}
                      {a.goal && (
                        <>
                          {" "}on goal{" "}
                          <span className="font-medium">"{a.goal.title}"</span>
                        </>
                      )}
                    </div>
                    {(a.oldValue || a.newValue) && (
                      <div className="text-xs text-muted-foreground mt-1 font-mono">
                        {a.oldValue && <span className="text-rose-600">- {a.oldValue}</span>}
                        {a.oldValue && a.newValue && " → "}
                        {a.newValue && <span className="text-emerald-600">+ {a.newValue}</span>}
                      </div>
                    )}
                    <div className="text-[10px] text-muted-foreground mt-1">
                      {a.createdAt.toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function actionVariant(a: string): "secondary" | "success" | "warning" | "danger" | "info" {
  if (a === "APPROVE" || a === "CREATE") return "success";
  if (a === "RETURN") return "warning";
  if (a === "DELETE" || a === "UNLOCK") return "danger";
  if (a === "UPDATE" || a === "CHECKIN") return "info";
  return "secondary";
}
