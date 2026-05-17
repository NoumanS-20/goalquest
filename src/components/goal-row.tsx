"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/lib/utils";
import { UOM_SHORT } from "@/lib/scoring";
import {
  Pencil,
  Trash2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Share2,
} from "lucide-react";

type Goal = {
  id: string;
  title: string;
  description: string | null;
  weightage: number;
  target: number | null;
  uomType: string;
  uomLabel: string | null;
  deadline: Date | null;
  status: string;
  managerNote: string | null;
  isShared: boolean;
  thrustArea: { name: string; color: string };
  checkIns: { score: number; quarter: string; createdAt: Date }[];
};

export function GoalRow({ goal, readOnly }: { goal: Goal; readOnly?: boolean }) {
  const router = useRouter();
  const [deleting, setDeleting] = React.useState(false);
  const latest = [...goal.checkIns].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
  const locked = goal.status === "APPROVED" || goal.status === "LOCKED";

  async function del() {
    if (!confirm(`Delete "${goal.title}"?`)) return;
    setDeleting(true);
    const res = await fetch(`/api/goals/${goal.id}`, { method: "DELETE" });
    const j = await res.json();
    if (!res.ok) {
      toast.error(j.error || "Delete failed");
    } else {
      toast.success("Goal deleted");
      router.refresh();
    }
    setDeleting(false);
  }

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted/40 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1.5">
          <Badge
            variant="outline"
            className="text-[10px]"
            style={{ borderColor: goal.thrustArea.color + "60", color: goal.thrustArea.color }}
          >
            {goal.thrustArea.name}
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            {UOM_SHORT[goal.uomType]}
          </Badge>
          {goal.isShared && (
            <Badge variant="info" className="text-[10px] gap-1">
              <Share2 className="h-3 w-3" /> Shared
            </Badge>
          )}
          <StatusBadge status={goal.status} />
        </div>
        <div className="font-medium truncate">{goal.title}</div>
        {goal.description && (
          <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{goal.description}</div>
        )}
        <div className="text-xs text-muted-foreground mt-1.5 flex items-center gap-3 flex-wrap">
          <span>
            Target: <strong className="text-foreground">{goal.target ?? "—"}
              {goal.uomLabel ? ` ${goal.uomLabel}` : ""}</strong>
          </span>
          {goal.deadline && (
            <span>
              Deadline: <strong className="text-foreground">{formatDate(goal.deadline)}</strong>
            </span>
          )}
          <span>
            Weight: <strong className="text-foreground">{goal.weightage}%</strong>
          </span>
          {latest && (
            <span>
              {latest.quarter} score: <strong className="text-foreground">{Math.round(latest.score)}%</strong>
            </span>
          )}
        </div>
        {goal.status === "RETURNED" && goal.managerNote && (
          <div className="mt-2 text-xs p-2 rounded bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 border border-rose-200/50 dark:border-rose-900/40">
            <strong>Manager note:</strong> {goal.managerNote}
          </div>
        )}
      </div>

      <div className="md:w-44 flex flex-col gap-1">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Latest score</span>
          <span>{latest ? `${Math.round(latest.score)}%` : "—"}</span>
        </div>
        <Progress value={latest?.score ?? 0} />
      </div>

      {!readOnly && (
        <div className="flex md:flex-col gap-1.5">
          {!locked && (
            <>
              <Button asChild size="sm" variant="outline">
                <Link href={`/dashboard/goals/${goal.id}`}>
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Link>
              </Button>
              <Button size="sm" variant="ghost" onClick={del} disabled={deleting}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
          {locked && (
            <Button size="sm" variant="outline" disabled className="cursor-not-allowed">
              <Lock className="h-3.5 w-3.5" />
              Locked
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { v: "secondary" | "success" | "warning" | "danger"; label: string; icon?: React.ComponentType<{ className?: string }> }> = {
    DRAFT: { v: "secondary", label: "Draft" },
    SUBMITTED: { v: "warning", label: "Submitted", icon: Clock },
    APPROVED: { v: "success", label: "Approved", icon: CheckCircle2 },
    LOCKED: { v: "success", label: "Locked", icon: Lock },
    RETURNED: { v: "danger", label: "Returned", icon: AlertTriangle },
  };
  const m = map[status] || map.DRAFT;
  const Icon = m.icon;
  return (
    <Badge variant={m.v} className="text-[10px] gap-1">
      {Icon && <Icon className="h-3 w-3" />}
      {m.label}
    </Badge>
  );
}
