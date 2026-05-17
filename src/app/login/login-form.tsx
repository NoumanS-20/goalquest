"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { initials } from "@/lib/utils";
import { Mail, KeyRound, Sparkles } from "lucide-react";

type Account = {
  id: string;
  email: string;
  name: string;
  role: string;
  designation: string | null;
  department: string | null;
};

export function LoginForm({ accounts }: { accounts: Account[] }) {
  const router = useRouter();
  const [email, setEmail] = React.useState("kabir@atomberg.com");
  const [password, setPassword] = React.useState("demo1234");
  const [loading, setLoading] = React.useState(false);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        toast.error(j.error || "Invalid credentials");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function quickLogin(accountEmail: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: accountEmail, password: "demo1234" }),
      });
      if (!res.ok) {
        toast.error("Login failed");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9"
              autoComplete="email"
              required
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9"
              autoComplete="current-password"
              required
            />
          </div>
        </div>
        <Button type="submit" disabled={loading} variant="brand" size="lg" className="w-full">
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            One-click demo accounts
          </span>
        </div>
      </div>

      <div className="grid gap-2">
        {accounts.map((a) => (
          <Card
            key={a.id}
            className="p-3 cursor-pointer hover:border-brand/40 hover:shadow-sm transition-all flex items-center justify-between gap-3"
            onClick={() => !loading && quickLogin(a.email)}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Avatar>
                <AvatarFallback>{initials(a.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{a.name}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {a.designation} · {a.department}
                </div>
              </div>
            </div>
            <Badge variant={roleVariant(a.role)} className="capitalize shrink-0">
              {a.role.toLowerCase()}
            </Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}

function roleVariant(role: string): "brand" | "info" | "success" {
  if (role === "ADMIN") return "brand";
  if (role === "MANAGER") return "info";
  return "success";
}
