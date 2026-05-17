"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { CheckCircle2, RotateCcw } from "lucide-react";

export function ApproveBox({ goalId }: { goalId: string }) {
  const router = useRouter();
  const [note, setNote] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function act(action: "approve" | "return") {
    if (action === "return" && !note.trim()) {
      toast.error("Add a note explaining why you're returning this goal.");
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/goals/${goalId}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, note: note || undefined }),
    });
    const j = await res.json();
    setLoading(false);
    if (!res.ok) return toast.error(j.error || "Action failed");
    toast.success(action === "approve" ? "Goal approved & locked" : "Returned for rework");
    router.refresh();
  }

  return (
    <div className="p-3 rounded-lg border border-dashed border-brand/40 bg-brand-gradient/5 space-y-2">
      <Textarea
        placeholder="Optional note (required when returning for rework)…"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
      />
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="outline" onClick={() => act("return")} disabled={loading}>
          <RotateCcw className="h-3.5 w-3.5" />
          Return for rework
        </Button>
        <Button size="sm" variant="brand" onClick={() => act("approve")} disabled={loading}>
          <CheckCircle2 className="h-3.5 w-3.5" />
          Approve & lock
        </Button>
      </div>
    </div>
  );
}
