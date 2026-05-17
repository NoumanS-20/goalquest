"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, RefreshCcw } from "lucide-react";

type Cycle = {
  id: string;
  goalSetOpen: string;
  q1Open: string;
  q2Open: string;
  q3Open: string;
  q4Open: string;
  escSubmitDays: number;
  escApproveDays: number;
  escCheckinDays: number;
};

export function CycleEditor({ cycle }: { cycle: Cycle }) {
  const router = useRouter();
  const [c, setC] = React.useState(cycle);
  const [loading, setLoading] = React.useState(false);
  const [runningEsc, setRunningEsc] = React.useState(false);

  async function save() {
    setLoading(true);
    const res = await fetch(`/api/cycles/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(c),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json();
      return toast.error(j.error || "Save failed");
    }
    toast.success("Cycle updated");
    router.refresh();
  }

  async function runEscalations() {
    setRunningEsc(true);
    const res = await fetch("/api/escalations/run", { method: "POST" });
    setRunningEsc(false);
    if (!res.ok) {
      const j = await res.json();
      return toast.error(j.error || "Run failed");
    }
    const j = await res.json();
    toast.success(`Escalation run complete — ${j.created} new alert(s)`);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <DateField label="Phase 1 Open" value={c.goalSetOpen} onChange={(v) => setC({ ...c, goalSetOpen: v })} />
        <DateField label="Q1 Opens" value={c.q1Open} onChange={(v) => setC({ ...c, q1Open: v })} />
        <DateField label="Q2 Opens" value={c.q2Open} onChange={(v) => setC({ ...c, q2Open: v })} />
        <DateField label="Q3 Opens" value={c.q3Open} onChange={(v) => setC({ ...c, q3Open: v })} />
        <DateField label="Q4 / Annual" value={c.q4Open} onChange={(v) => setC({ ...c, q4Open: v })} />
      </div>

      <div className="rounded-lg border border-border p-4 bg-muted/30">
        <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">
          Escalation thresholds (days)
        </div>
        <div className="grid grid-cols-3 gap-3">
          <NumField label="Submit not done" value={c.escSubmitDays} onChange={(v) => setC({ ...c, escSubmitDays: v })} />
          <NumField label="Approval pending" value={c.escApproveDays} onChange={(v) => setC({ ...c, escApproveDays: v })} />
          <NumField label="Check-in missing" value={c.escCheckinDays} onChange={(v) => setC({ ...c, escCheckinDays: v })} />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={runEscalations} disabled={runningEsc}>
          <RefreshCcw className="h-4 w-4" />
          {runningEsc ? "Running…" : "Run escalation check now"}
        </Button>
        <Button variant="brand" onClick={save} disabled={loading}>
          <Save className="h-4 w-4" />
          {loading ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</Label>
      <Input type="date" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
function NumField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-1">
      <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</Label>
      <Input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}
