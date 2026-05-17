import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";

type Row = {
  name: string;
  approvedCount: number;
  quarters: { q: string; ratio: number }[];
};

function color(r: number) {
  if (r === 0) return "bg-muted text-muted-foreground";
  if (r < 0.34) return "bg-rose-200 dark:bg-rose-900/40 text-rose-800 dark:text-rose-200";
  if (r < 0.67) return "bg-amber-200 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200";
  if (r < 1) return "bg-emerald-200 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200";
  return "bg-emerald-500 text-white";
}

export function CompletionHeatmap({ rows }: { rows: Row[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quarterly check-in heatmap</CardTitle>
        <CardDescription>
          Green = full coverage, amber = partial, rose = light, grey = none.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-1.5">
          <div className="grid grid-cols-[1fr_60px_60px_60px_60px] gap-1 text-[10px] uppercase text-muted-foreground font-medium tracking-wide px-1">
            <div>Employee</div>
            <div className="text-center">Q1</div>
            <div className="text-center">Q2</div>
            <div className="text-center">Q3</div>
            <div className="text-center">Q4</div>
          </div>
          {rows.map((r) => (
            <div key={r.name} className="grid grid-cols-[1fr_60px_60px_60px_60px] gap-1 items-center">
              <div className="flex items-center gap-2 min-w-0">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-[9px]">{initials(r.name)}</AvatarFallback>
                </Avatar>
                <span className="text-xs truncate">{r.name}</span>
              </div>
              {r.quarters.map(({ q, ratio }) => (
                <div
                  key={q}
                  className={`h-8 rounded grid place-items-center text-[10px] font-medium ${color(ratio)}`}
                  title={`${q}: ${Math.round(ratio * 100)}% complete`}
                >
                  {r.approvedCount === 0 ? "—" : `${Math.round(ratio * 100)}%`}
                </div>
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
