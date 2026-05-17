"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Share2 } from "lucide-react";

export function ShareGoalButton({ team }: { team: { id: string; name: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [target, setTarget] = React.useState("");
  const [uomLabel, setUomLabel] = React.useState("");
  const [weightage, setWeightage] = React.useState("20");
  const [recipients, setRecipients] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);

  function toggle(id: string) {
    setRecipients((r) => (r.includes(id) ? r.filter((x) => x !== id) : [...r, id]));
  }

  async function push() {
    if (!title.trim()) return toast.error("Title required");
    if (recipients.length === 0) return toast.error("Pick at least one recipient");
    setLoading(true);
    const res = await fetch("/api/goals/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        target: target ? Number(target) : null,
        uomLabel,
        weightage: Number(weightage),
        recipientIds: recipients,
      }),
    });
    setLoading(false);
    const j = await res.json();
    if (!res.ok) return toast.error(j.error || "Failed");
    toast.success(`Shared goal pushed to ${recipients.length} report(s)`);
    setOpen(false);
    setTitle(""); setDescription(""); setTarget(""); setUomLabel(""); setWeightage("20"); setRecipients([]);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="brand">
          <Share2 className="h-4 w-4" />
          Push shared goal
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Push a shared / departmental goal</DialogTitle>
          <DialogDescription>
            Recipients receive an APPROVED, locked goal with the same title and target.
            They can only adjust weightage.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Department-wide NPS ≥ 65" />
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label>Target</Label>
              <Input type="number" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="65" />
            </div>
            <div className="space-y-1">
              <Label>Unit label</Label>
              <Input value={uomLabel} onChange={(e) => setUomLabel(e.target.value)} placeholder="NPS, %, units" />
            </div>
            <div className="space-y-1">
              <Label>Default weight</Label>
              <Input type="number" value={weightage} onChange={(e) => setWeightage(e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="mb-2 block">Recipients</Label>
            <div className="max-h-40 overflow-y-auto rounded border border-border divide-y divide-border">
              {team.map((t) => (
                <label
                  key={t.id}
                  className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-muted/40"
                >
                  <input
                    type="checkbox"
                    checked={recipients.includes(t.id)}
                    onChange={() => toggle(t.id)}
                  />
                  <span className="text-sm">{t.name}</span>
                </label>
              ))}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{recipients.length} selected</div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="brand" onClick={push} disabled={loading}>
            <Share2 className="h-4 w-4" />
            {loading ? "Pushing…" : "Push goal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
