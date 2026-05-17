"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn, initials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown";
import {
  LayoutDashboard,
  Goal,
  Users,
  Settings,
  BarChart3,
  Bell,
  LogOut,
  RefreshCcw,
  ClipboardCheck,
  FileSpreadsheet,
  Building2,
  ShieldAlert,
  History,
  Menu,
  X,
} from "lucide-react";
import { GoalQuestMark } from "@/components/brand/goalquest-mark";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
};

type Account = {
  id: string;
  email: string;
  name: string;
  role: string;
  department: string | null;
};

export function AppShell({
  user,
  accounts,
  pendingCount,
  children,
}: {
  user: User;
  accounts: Account[];
  pendingCount: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const nav = navFor(user.role);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  async function switchUser(email: string) {
    await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: "demo1234" }),
    });
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex bg-canvas">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white/70 backdrop-blur-xl border-r border-slate-200/60 flex-col transition-transform lg:translate-x-0",
          mobileOpen ? "flex translate-x-0" : "hidden lg:flex -translate-x-full",
        )}
      >
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200/60">
          <Link href="/dashboard" className="flex items-center gap-2.5 font-semibold tracking-tight">
            <GoalQuestMark className="h-7 w-7" />
            <span className="text-[15px]">GoalQuest</span>
          </Link>
          <Button size="icon" variant="ghost" className="lg:hidden" onClick={() => setMobileOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {nav.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center justify-between gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-all",
                  active
                    ? "bg-slate-900 text-white shadow-soft"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80",
                )}
              >
                <span className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </span>
                {item.badge && pendingCount > 0 && (
                  <span className={cn(
                    "text-[10px] font-semibold px-1.5 py-0.5 rounded-md",
                    active ? "bg-white/20 text-white" : "bg-rose-100 text-rose-600",
                  )}>
                    {pendingCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200/60 p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-slate-100/80 transition-colors text-left">
                <Avatar className="ring-2 ring-white shadow-soft">
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-xs font-semibold">
                    {initials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium truncate text-slate-900">{user.name}</div>
                  <div className="text-[11px] text-slate-500 capitalize">
                    {user.role.toLowerCase()}
                  </div>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Switch user (demo)</DropdownMenuLabel>
              {accounts.map((a) => (
                <DropdownMenuItem
                  key={a.id}
                  onClick={() => switchUser(a.email)}
                  className={cn(a.id === user.id && "bg-slate-100")}
                >
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarFallback className="text-[10px]">{initials(a.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">{a.name}</div>
                    <div className="text-[10px] text-muted-foreground capitalize">
                      {a.role.toLowerCase()} · {a.department}
                    </div>
                  </div>
                  {a.id === user.id && <Badge variant="success" className="text-[9px]">now</Badge>}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 px-4 lg:px-8 flex items-center justify-between bg-white/70 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-30">
          <Button size="icon" variant="ghost" className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="hidden lg:flex items-center gap-3">
            <span className="chip">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              FY 2026-27 · Cycle active
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button className="h-9 w-9 grid place-items-center rounded-full hover:bg-slate-100 transition-colors text-slate-600 relative">
              <Bell className="h-4 w-4" />
              {pendingCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 max-w-[1400px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}

function navFor(role: string) {
  if (role === "EMPLOYEE") {
    return [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/dashboard/goals", label: "My Goals", icon: Goal },
      { href: "/dashboard/checkins", label: "Check-ins", icon: ClipboardCheck },
      { href: "/dashboard/audit", label: "History", icon: History },
    ];
  }
  if (role === "MANAGER") {
    return [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/dashboard/team", label: "Team", icon: Users, badge: true },
      { href: "/dashboard/goals", label: "My Goals", icon: Goal },
      { href: "/dashboard/checkins", label: "Check-ins", icon: ClipboardCheck },
      { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/dashboard/audit", label: "Audit Trail", icon: History },
    ];
  }
  // ADMIN
  return [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/org", label: "Organization", icon: Building2 },
    { href: "/dashboard/cycles", label: "Cycles", icon: RefreshCcw },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/dashboard/reports", label: "Reports", icon: FileSpreadsheet },
    { href: "/dashboard/escalations", label: "Escalations", icon: ShieldAlert, badge: true },
    { href: "/dashboard/audit", label: "Audit Trail", icon: History },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];
}
