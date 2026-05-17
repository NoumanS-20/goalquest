"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
          <Label htmlFor="email" className="text-[12px] font-medium text-slate-700">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-11 rounded-lg border-slate-200 bg-white shadow-soft focus-visible:border-slate-300 focus-visible:ring-slate-200"
              autoComplete="email"
              required
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-[12px] font-medium text-slate-700">Password</Label>
          <div className="relative">
            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-11 rounded-lg border-slate-200 bg-white shadow-soft focus-visible:border-slate-300 focus-visible:ring-slate-200"
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
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em]">
          <span className="bg-white px-3 text-slate-500 flex items-center gap-1.5 font-medium">
            <Sparkles className="h-3 w-3" />
            One-click demo accounts
          </span>
        </div>
      </div>

      <div className="grid gap-2 max-h-[280px] overflow-y-auto pr-1 -mr-1">
        {accounts.map((a) => (
          <button
            key={a.id}
            onClick={() => !loading && quickLogin(a.email)}
            disabled={loading}
            className="group w-full text-left rounded-lg bg-white border border-slate-200/80 p-3 shadow-soft hover:shadow-soft-lg hover:-translate-y-0.5 hover:border-slate-300 transition-all flex items-center justify-between gap-3 disabled:opacity-50 disabled:pointer-events-none"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="ring-2 ring-white shadow-soft">
                <AvatarFallback className={`text-xs font-semibold text-white ${roleAvatarBg(a.role)}`}>
                  {initials(a.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="text-[13.5px] font-medium text-slate-900 truncate">{a.name}</div>
                <div className="text-[11px] text-slate-500 truncate">
                  {a.designation} · {a.department}
                </div>
              </div>
            </div>
            <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md capitalize shrink-0 ${roleChip(a.role)}`}>
              {a.role.toLowerCase()}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function roleAvatarBg(role: string) {
  if (role === "ADMIN") return "bg-gradient-to-br from-slate-700 to-slate-900";
  if (role === "MANAGER") return "bg-gradient-to-br from-indigo-500 to-purple-500";
  return "bg-gradient-to-br from-sky-500 to-blue-500";
}

function roleChip(role: string) {
  if (role === "ADMIN") return "bg-slate-100 text-slate-700";
  if (role === "MANAGER") return "bg-purple-100 text-purple-700";
  return "bg-blue-100 text-blue-700";
}
