"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { UOM_LABELS } from "@/lib/scoring";
import { Save, ArrowLeft, Info } from "lucide-react";

type ThrustArea = { id: string; name: string; color: string };
type Initial = {
  id: string;
  title: string;
  description: string | null;
  thrustAreaId: string;
  uomType: string;
  uomLabel: string | null;
  target: number | null;
  deadline: string | null;
  weightage: number;
};

export function GoalForm({
  thrustAreas,
  remainingWeight,
  initial,
}: {
  thrustAreas: ThrustArea[];
  remainingWeight: number;
  initial?: Initial;
}) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [title, setTitle] = React.useState(initial?.title ?? "");
  const [description, setDescription] = React.useState(initial?.description ?? "");
  const [thrustAreaId, setThrustAreaId] = React.useState(initial?.thrustAreaId ?? thrustAreas[0]?.id ?? "");
  const [uomType, setUomType] = React.useState(initial?.uomType ?? "MIN_NUMERIC");
  const [uomLabel, setUomLabel] = React.useState(initial?.uomLabel ?? "");
  const [target, setTarget] = React.useState<string>(initial?.target?.toString() ?? "");
  const [deadline, setDeadline] = React.useState<string>(initial?.deadline ?? "");
  const [weightage, setWeightage] = React.useState<string>(
    initial?.weightage?.toString() ?? Math.min(remainingWeight, 25).toString(),
  );

  const wNum = Number(weightage) || 0;
  const wInvalid = wNum < 10 || wNum > 100 || wNum > (remainingWeight + (initial?.weightage ?? 0));

  async function save() {
    if (!title.trim()) return toast.error("Title is required");
    if (!thrustAreaId) return toast.error("Thrust area is required");
    if (wInvalid) return toast.error(`Weightage must be 10–${remainingWeight + (initial?.weightage ?? 0)}%`);
    if (uomType === "TIMELINE" && !deadline) return toast.error("Deadline required for Timeline goals");
    if (["MIN_NUMERIC", "MIN_PCT", "MAX_NUMERIC", "MAX_PCT"].includes(uomType) && !target) {
      return toast.error("Target is required");
    }

    setLoading(true);
    try {
      const payload = {
        title,
        description: description || null,
        thrustAreaId,
        uomType,
        uomLabel: uomLabel || null,
        target: ["MIN_NUMERIC", "MIN_PCT", "MAX_NUMERIC", "MAX_PCT", "ZERO"].includes(uomType)
          ? Number(target || 0)
          : null,
        deadline: uomType === "TIMELINE" ? deadline : null,
        weightage: wNum,
      };
      const res = initial
        ? await fetch(`/api/goals/${initial.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/goals", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      const j = await res.json();
      if (!res.ok) {
        toast.error(j.error || "Save failed");
        return;
      }
      toast.success(initial ? "Goal updated" : "Goal created");
      router.push("/dashboard/goals");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Goal details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="title">Goal title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Achieve ₹12 Cr regional sales revenue"
            maxLength={200}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="desc">Description</Label>
          <Textarea
            id="desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does success look like? Why does this matter?"
            rows={3}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Thrust Area *</Label>
            <Select value={thrustAreaId} onValueChange={setThrustAreaId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a thrust area" />
              </SelectTrigger>
              <SelectContent>
                {thrustAreas.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ background: t.color }} />
                      {t.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Unit of Measurement *</Label>
            <Select value={uomType} onValueChange={setUomType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(UOM_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {uomType !== "TIMELINE" && (
            <div className="space-y-1.5">
              <Label htmlFor="target">
                Target {uomType === "ZERO" ? "(fixed at 0)" : "*"}
              </Label>
              <Input
                id="target"
                type="number"
                step="any"
                value={uomType === "ZERO" ? "0" : target}
                disabled={uomType === "ZERO"}
                onChange={(e) => setTarget(e.target.value)}
                placeholder={uomType === "MIN_PCT" || uomType === "MAX_PCT" ? "e.g. 95" : "e.g. 12"}
              />
            </div>
          )}

          {uomType === "TIMELINE" && (
            <div className="space-y-1.5">
              <Label htmlFor="deadline">Deadline *</Label>
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="label">Unit label (optional)</Label>
            <Input
              id="label"
              value={uomLabel}
              onChange={(e) => setUomLabel(e.target.value)}
              placeholder="e.g. ₹ Cr, days, %, NPS"
              maxLength={50}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="weight">Weightage * (10 – {remainingWeight + (initial?.weightage ?? 0)}%)</Label>
            <Badge variant={wInvalid ? "danger" : "success"}>{wNum}%</Badge>
          </div>
          <Input
            id="weight"
            type="number"
            step="1"
            min={10}
            max={100}
            value={weightage}
            onChange={(e) => setWeightage(e.target.value)}
          />
          <div className="text-xs text-muted-foreground flex items-start gap-1.5 mt-1">
            <Info className="h-3 w-3 mt-0.5" />
            Minimum 10% per goal · all goals together must total exactly 100% to submit.
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" /> Cancel
          </Button>
          <Button variant="brand" onClick={save} disabled={loading}>
            <Save className="h-4 w-4" />
            {loading ? "Saving…" : initial ? "Save changes" : "Create goal"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
