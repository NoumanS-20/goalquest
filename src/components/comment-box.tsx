"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { initials } from "@/lib/utils";
import { MessageSquare, Send } from "lucide-react";

type Comment = {
  id: string;
  comment: string;
  quarter: string;
  createdAt: Date;
  author: { id: string; name: string; role: string };
};

export function CommentBox({
  goalId,
  quarter,
  existing,
}: {
  goalId: string;
  quarter: string;
  existing: Comment[];
}) {
  const router = useRouter();
  const [text, setText] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function post() {
    if (!text.trim()) return;
    setLoading(true);
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goalId, quarter, comment: text }),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json();
      toast.error(j.error || "Failed");
      return;
    }
    setText("");
    toast.success("Comment posted");
    router.refresh();
  }

  return (
    <div className="border-t border-border pt-3">
      <div className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-2">
        <MessageSquare className="h-3 w-3" />
        Check-in discussion {existing.length > 0 && `(${existing.length})`}
      </div>
      {existing.length > 0 && (
        <div className="space-y-2 mb-3">
          {existing.map((c) => (
            <div key={c.id} className="flex gap-2 text-sm">
              <Avatar className="h-7 w-7 flex-shrink-0">
                <AvatarFallback className="text-[10px]">{initials(c.author.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-medium">{c.author.name}</span>
                  <Badge variant="outline" className="text-[9px]">{c.quarter}</Badge>
                  <span className="text-muted-foreground">{new Date(c.createdAt).toLocaleString("en-IN")}</span>
                </div>
                <p className="text-sm mt-0.5">{c.comment}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Add a structured ${quarter} check-in comment…`}
          rows={2}
          className="text-sm"
        />
        <Button size="sm" variant="brand" onClick={post} disabled={loading || !text.trim()}>
          <Send className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
