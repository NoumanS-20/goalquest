"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Unlock } from "lucide-react";

export function UnlockGoalButton({ goalId, title }: { goalId: string; title: string }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  async function go() {
    if (!confirm(`Unlock "${title}"? The employee will be able to edit again.`)) return;
    setLoading(true);
    const res = await fetch(`/api/goals/${goalId}/unlock`, { method: "POST" });
    setLoading(false);
    if (!res.ok) return toast.error("Failed");
    toast.success("Goal unlocked");
    router.refresh();
  }
  return (
    <Button size="sm" variant="outline" onClick={go} disabled={loading}>
      <Unlock className="h-3.5 w-3.5" />
      Unlock
    </Button>
  );
}
