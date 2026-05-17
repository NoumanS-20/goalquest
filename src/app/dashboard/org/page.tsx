import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { initials } from "@/lib/utils";
import { Users, Building2 } from "lucide-react";

export default async function OrgPage() {
  await requireRole("ADMIN");

  const users = await prisma.user.findMany({
    include: { manager: true, reports: true, goals: true },
    orderBy: [{ department: "asc" }, { role: "asc" }, { name: "asc" }],
  });

  const byDept = users.reduce<Record<string, typeof users>>((acc, u) => {
    const k = u.department || "Unassigned";
    if (!acc[k]) acc[k] = [];
    acc[k].push(u);
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="display-heading text-4xl font-bold text-slate-900">Organization</h1>
        <p className="text-muted-foreground mt-1">
          <Users className="h-4 w-4 inline mr-1" />
          {users.length} users across {Object.keys(byDept).length} departments
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {Object.entries(byDept).map(([dept, list]) => (
          <Card key={dept}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4 text-brand-gradient" />
                {dept}
              </CardTitle>
              <CardDescription>{list.length} users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {list.map((u) => (
                <div key={u.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/40">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-[10px]">{initials(u.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{u.name}</div>
                    <div className="text-[10px] text-muted-foreground truncate">
                      {u.designation}{u.manager && ` · reports to ${u.manager.name}`}
                    </div>
                  </div>
                  <Badge variant={u.role === "ADMIN" ? "brand" : u.role === "MANAGER" ? "info" : "success"} className="text-[10px]">
                    {u.role.toLowerCase()}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">{u.goals.length} goals</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
