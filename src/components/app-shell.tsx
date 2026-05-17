"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn, initials } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
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
  Target,
  LayoutDashboard,
  Goal,
  Users,
  Settings,
  BarChart3,
  Bell,
  Moon,
  Sun,
  LogOut,
  UserCircle,
  RefreshCcw,
  ClipboardCheck,
  FileSpreadsheet,
  Building2,
  ShieldAlert,
  History,
  Menu,
  X,
} from "lucide-react";

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
  const { theme, toggle } = useTheme();
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
    <div className="min-h-screen flex bg-muted/30">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-card border-r border-border flex-col transition-transform lg:translate-x-0",
          mobileOpen ? "flex translate-x-0" : "hidden lg:flex -translate-x-full",
        )}
      >
        <div className="h-16 px-5 flex items-center justify-between border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <div className="h-7 w-7 rounded-md bg-brand-gradient grid place-items-center">
              <Target className="h-4 w-4 text-white" />
            </div>
            GoalQuest
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
                  "flex items-center justify-between gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-gradient text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                <span className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </span>
                {item.badge && pendingCount > 0 && (
                  <Badge variant={active ? "secondary" : "danger"} className="text-[10px] px-1.5 py-0">
                    {pendingCount}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors text-left">
                <Avatar>
                  <AvatarFallback>{initials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{user.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">
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
                  className={cn(a.id === user.id && "bg-muted")}
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
        <header className="h-16 px-4 lg:px-8 flex items-center justify-between bg-card/60 backdrop-blur border-b border-border sticky top-0 z-30">
          <Button size="icon" variant="ghost" className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="text-sm text-muted-foreground hidden lg:block">
            <span className="font-mono">FY 2026-27</span> · Goal Cycle Active
          </div>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" onClick={toggle}>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button size="icon" variant="ghost" className="relative">
              <Bell className="h-4 w-4" />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 text-[9px] font-bold rounded-full bg-rose-500 text-white grid place-items-center">
                  {pendingCount}
                </span>
              )}
            </Button>
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
