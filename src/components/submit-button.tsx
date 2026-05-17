"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

export function SubmitButton({ disabled, reason }: { disabled?: boolean; reason?: string }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  async function submit() {
    setLoading(true);
    try {
      const res = await fetch("/api/goals/submit", { method: "POST" });
      const j = await res.json();
      if (!res.ok) {
        toast.error(j.error || "Failed to submit");
        return;
      }
      toast.success("Goal sheet submitted for approval");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="brand"
      onClick={submit}
      disabled={disabled || loading}
      title={disabled ? reason : "Submit for approval"}
    >
      <Send className="h-4 w-4" />
      {loading ? "Submitting…" : "Submit for approval"}
    </Button>
  );
}
