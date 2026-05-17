"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

export function RunEscalationsButton() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  async function run() {
    setLoading(true);
    const res = await fetch("/api/escalations/run", { method: "POST" });
    setLoading(false);
    if (!res.ok) return toast.error("Run failed");
    const j = await res.json();
    toast.success(`Run complete — ${j.created} new alert(s)`);
    router.refresh();
  }
  return (
    <Button variant="brand" onClick={run} disabled={loading}>
      <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
      {loading ? "Running…" : "Run escalation check"}
    </Button>
  );
}
