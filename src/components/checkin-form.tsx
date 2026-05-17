"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { computeScore, UOM_SHORT } from "@/lib/scoring";
import { Save } from "lucide-react";

type Goal = {
  id: string;
  title: string;
  uomType: string;
  uomLabel: string | null;
  target: number | null;
  deadline: string | null;
  progressStatus: string;
  thrustArea: { name: string; color: string };
};

export function CheckinForm({
  goal,
  quarter,
  existing,
}: {
  goal: Goal;
  quarter: string;
  existing: { actualValue: number | null; actualDate: string | null; notes: string | null; score: number } | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [actualValue, setActualValue] = React.useState<string>(existing?.actualValue?.toString() ?? "");
  const [actualDate, setActualDate] = React.useState<string>(
    existing?.actualDate ? existing.actualDate.slice(0, 10) : "",
  );
  const [notes, setNotes] = React.useState<string>(existing?.notes ?? "");
  const [status, setStatus] = React.useState<string>(goal.progressStatus);

  const val = actualValue !== "" ? Number(actualValue) : null;
  const dt = actualDate ? new Date(actualDate) : null;
  const liveScore = computeScore(
    goal.uomType,
    goal.target,
    val,
    goal.deadline ? new Date(goal.deadline) : null,
    dt,
  );

  async function save() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalId: goal.id,
          quarter,
          actualValue: goal.uomType === "TIMELINE" ? null : actualValue,
          actualDate: goal.uomType === "TIMELINE" ? actualDate : null,
          notes,
          progressStatus: status,
        }),
      });
      const j = await res.json();
      if (!res.ok) {
        toast.error(j.error || "Save failed");
        return;
      }
      toast.success(`${quarter} check-in saved — score: ${Math.round(j.score)}%`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-border p-4 hover:bg-muted/30 transition-colors">
      <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Badge variant="outline" className="text-[10px]" style={{ borderColor: goal.thrustArea.color + "60", color: goal.thrustArea.color }}>
              {goal.thrustArea.name}
            </Badge>
            <Badge variant="outline" className="text-[10px]">{UOM_SHORT[goal.uomType]}</Badge>
          </div>
          <div className="font-medium truncate">{goal.title}</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Target: <strong>{goal.target ?? "—"}{goal.uomLabel ? ` ${goal.uomLabel}` : ""}</strong>
            {goal.deadline && <> · Deadline: <strong>{new Date(goal.deadline).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</strong></>}
          </div>
        </div>
        <div className="w-44">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
            <span>Live score</span>
            <span className="font-mono">{Math.round(liveScore)}%</span>
          </div>
          <Progress value={liveScore} />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        {goal.uomType === "TIMELINE" ? (
          <div className="space-y-1">
            <Label className="text-xs">Completion date</Label>
            <Input type="date" value={actualDate} onChange={(e) => setActualDate(e.target.value)} />
          </div>
        ) : (
          <div className="space-y-1">
            <Label className="text-xs">
              Actual {goal.uomType === "ZERO" ? "(incidents)" : "value"}
            </Label>
            <Input
              type="number"
              step="any"
              value={actualValue}
              onChange={(e) => setActualValue(e.target.value)}
              placeholder={goal.uomType === "ZERO" ? "0" : "e.g. 3.2"}
            />
          </div>
        )}

        <div className="space-y-1">
          <Label className="text-xs">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NOT_STARTED">Not Started</SelectItem>
              <SelectItem value="ON_TRACK">On Track</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1 md:col-span-1">
          <Label className="text-xs">Notes</Label>
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional comment" />
        </div>
      </div>

      <div className="flex justify-end mt-3">
        <Button size="sm" variant="brand" onClick={save} disabled={loading}>
          <Save className="h-3.5 w-3.5" />
          {loading ? "Saving…" : existing ? "Update" : "Save"}
        </Button>
      </div>
    </div>
  );
}
