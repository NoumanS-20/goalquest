"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export function ResolveButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  async function resolve() {
    setLoading(true);
    const res = await fetch(`/api/escalations/${id}/resolve`, { method: "POST" });
    setLoading(false);
    if (!res.ok) return toast.error("Failed");
    toast.success("Marked resolved");
    router.refresh();
  }
  return (
    <Button size="sm" variant="outline" onClick={resolve} disabled={loading}>
      <Check className="h-3.5 w-3.5" />
      Resolve
    </Button>
  );
}
