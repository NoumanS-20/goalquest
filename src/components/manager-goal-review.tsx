"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, RotateCcw, Save } from "lucide-react";

type ReviewGoal = {
  id: string;
  uomType: string;
  target: number | null;
  deadline: string | null;
  weightage: number;
};

export function ManagerGoalReview({ goal }: { goal: ReviewGoal }) {
  const router = useRouter();
  const [target, setTarget] = React.useState(goal.target?.toString() ?? "");
  const [deadline, setDeadline] = React.useState(goal.deadline?.slice(0, 10) ?? "");
  const [weightage, setWeightage] = React.useState(goal.weightage.toString());
  const [note, setNote] = React.useState("");
  const [loading, setLoading] = React.useState<"save" | "approve" | "return" | null>(null);

  const isTimeline = goal.uomType === "TIMELINE";
  const isZero = goal.uomType === "ZERO";
  const weightNumber = Number(weightage);

  async function saveChanges() {
    if (!Number.isFinite(weightNumber) || weightNumber < 10 || weightNumber > 100) {
      toast.error("Weightage must be between 10% and 100%.");
      return false;
    }
    if (!isTimeline && !isZero && target.trim() === "") {
      toast.error("Target is required.");
      return false;
    }
    if (isTimeline && !deadline) {
      toast.error("Deadline is required.");
      return false;
    }

    setLoading("save");
    try {
      const payload: Record<string, unknown> = { weightage: weightNumber };
      if (isTimeline) {
        payload.deadline = deadline;
        payload.target = null;
      } else {
        payload.target = isZero ? 0 : Number(target);
      }

      const res = await fetch(`/api/goals/${goal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await res.json();
      if (!res.ok) {
        toast.error(j.error || "Unable to save review edits.");
        return false;
      }
      toast.success("Review edits saved");
      router.refresh();
      return true;
    } finally {
      setLoading(null);
    }
  }

  async function act(action: "approve" | "return") {
    if (action === "return" && !note.trim()) {
      toast.error("Add a note explaining why you're returning this goal.");
      return;
    }

    if (action === "approve") {
      const saved = await saveChanges();
      if (!saved) return;
    }

    setLoading(action);
    try {
      const res = await fetch(`/api/goals/${goal.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note: note || undefined }),
      });
      const j = await res.json();
      if (!res.ok) {
        toast.error(j.error || "Action failed");
        return;
      }
      toast.success(action === "approve" ? "Goal approved and locked" : "Returned for rework");
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-dashed border-blue-200 bg-blue-50/60 p-3">
      <div className="grid gap-3 md:grid-cols-3">
        {isTimeline ? (
          <div className="space-y-1">
            <Label className="text-xs" htmlFor={`deadline-${goal.id}`}>
              Deadline
            </Label>
            <Input
              id={`deadline-${goal.id}`}
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
        ) : (
          <div className="space-y-1">
            <Label className="text-xs" htmlFor={`target-${goal.id}`}>
              Target
            </Label>
            <Input
              id={`target-${goal.id}`}
              type="number"
              step="any"
              value={isZero ? "0" : target}
              disabled={isZero}
              onChange={(e) => setTarget(e.target.value)}
            />
          </div>
        )}
        <div className="space-y-1">
          <Label className="text-xs" htmlFor={`weight-${goal.id}`}>
            Weightage
          </Label>
          <Input
            id={`weight-${goal.id}`}
            type="number"
            min={10}
            max={100}
            step="1"
            value={weightage}
            onChange={(e) => setWeightage(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <Button
            className="w-full"
            size="sm"
            variant="outline"
            onClick={saveChanges}
            disabled={loading !== null}
          >
            <Save className="h-3.5 w-3.5" />
            Save edits
          </Button>
        </div>
      </div>

      <Textarea
        placeholder="Approval note, or required reason when returning for rework..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
      />
      <div className="flex flex-wrap justify-end gap-2">
        <Button size="sm" variant="outline" onClick={() => act("return")} disabled={loading !== null}>
          <RotateCcw className="h-3.5 w-3.5" />
          Return for rework
        </Button>
        <Button size="sm" variant="brand" onClick={() => act("approve")} disabled={loading !== null}>
          <CheckCircle2 className="h-3.5 w-3.5" />
          Approve and lock
        </Button>
      </div>
    </div>
  );
}
