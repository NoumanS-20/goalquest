import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { GoalQuestMark } from "@/components/brand/goalquest-mark";
import { LoginForm } from "./login-form";
import { ClipboardCheck, ShieldCheck, Target, Users, Workflow, BarChart3 } from "lucide-react";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  const accounts = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, designation: true, department: true },
    orderBy: { role: "asc" },
  });

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-canvas text-slate-900">
      {/* === Left: brand panel (Apple-style) === */}
      <div className="hidden lg:flex relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-paper opacity-50 pointer-events-none" />

        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-2.5 font-semibold tracking-tight z-10">
          <GoalQuestMark className="h-8 w-8" />
          <span className="text-[15px]">GoalQuest</span>
        </Link>

        {/* Floating brand collage */}
        <div className="relative flex-1 grid place-items-center">
          {/* Sticky note top-left */}
          <div
            className="absolute top-4 left-2 w-[180px] animate-float"
            style={{ ["--tilt" as never]: "-6deg" }}
          >
            <div
              className="relative bg-yellow-200 p-4 shadow-soft-lg"
              style={{ transform: "rotate(-6deg)" }}
            >
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-rose-500 shadow-sm" />
              <p className="text-[13px] text-slate-800 leading-snug"
                 style={{ fontFamily: "'Caveat', 'Segoe Script', cursive" }}>
                Welcome back!
                <br />
                Pick a role to
                <br />
                jump right in →
              </p>
            </div>
          </div>

          {/* Reminders card top-right */}
          <div
            className="absolute top-2 right-2 w-[220px] animate-float-slow"
            style={{ ["--tilt" as never]: "4deg" }}
          >
            <div className="glass-card rounded-2xl p-4 shadow-soft-lg" style={{ transform: "rotate(4deg)" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Today</span>
                <span className="text-[10px] font-mono text-emerald-600">On track</span>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-indigo-100 grid place-items-center">
                    <ClipboardCheck className="h-3.5 w-3.5 text-indigo-600" />
                  </div>
                  <div className="text-[12px] text-slate-700">Q1 Check-in due</div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-purple-100 grid place-items-center">
                    <Users className="h-3.5 w-3.5 text-purple-600" />
                  </div>
                  <div className="text-[12px] text-slate-700">Approve · Anika</div>
                </div>
              </div>
            </div>
          </div>

          {/* Central 3D mark */}
          <div className="relative">
            <div className="absolute inset-0 -m-12 rounded-full bg-gradient-to-br from-indigo-100 via-white to-purple-100 blur-3xl opacity-80" />
            <div className="relative h-36 w-36">
              <div className="absolute inset-0 rounded-[28%] bg-gradient-to-br from-white to-slate-100 shadow-soft-lg" />
              <div className="absolute inset-2 rounded-[26%] bg-gradient-to-br from-white via-white to-slate-50 border border-slate-200/80" />
              <div className="absolute inset-0 grid place-items-center">
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 shadow-md" />
                  <div className="h-6 w-6 rounded-full bg-slate-900" />
                  <div className="h-6 w-6 rounded-full bg-slate-900" />
                  <div className="h-6 w-6 rounded-full bg-slate-900" />
                </div>
              </div>
              <div className="absolute top-3 left-3 right-12 h-6 rounded-full bg-white/60 blur-md" />
            </div>
          </div>

          {/* Goal mini-card bottom-left */}
          <div
            className="absolute bottom-4 left-2 w-[260px] animate-float-fast"
            style={{ ["--tilt" as never]: "-3deg" }}
          >
            <div className="glass-card rounded-2xl p-4 shadow-soft-lg" style={{ transform: "rotate(-3deg)" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] font-semibold text-slate-900">Q1 progress</span>
                <span className="text-[10px] text-slate-400">FY26</span>
              </div>
              <div className="space-y-2.5">
                <MiniRow color="bg-emerald-500" label="Cut churn under 4%" pct={92} />
                <MiniRow color="bg-blue-500" label="Ship Atom Quest v2" pct={88} />
                <MiniRow color="bg-purple-500" label="Hire 3 engineers" pct={33} />
              </div>
            </div>
          </div>

          {/* Audit card bottom-right */}
          <div
            className="absolute bottom-6 right-2 w-[210px] animate-float"
            style={{ ["--tilt" as never]: "5deg" }}
          >
            <div className="glass-card rounded-2xl p-4 shadow-soft-lg" style={{ transform: "rotate(5deg)" }}>
              <div className="text-[12px] font-semibold text-slate-900 mb-3">Audit-ready</div>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { bg: "bg-blue-500", icon: ShieldCheck },
                  { bg: "bg-emerald-500", icon: Target },
                  { bg: "bg-purple-500", icon: Workflow },
                  { bg: "bg-orange-500", icon: ClipboardCheck },
                  { bg: "bg-pink-500", icon: BarChart3 },
                  { bg: "bg-indigo-500", icon: Users },
                ].map((c, i) => (
                  <div key={i} className={`h-9 w-9 rounded-lg ${c.bg} grid place-items-center shadow-soft`}>
                    <c.icon className="h-4 w-4 text-white" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-[12px] text-slate-500">
          © 2026 · AtomQuest Hackathon 1.0
        </div>
      </div>

      {/* === Right: form panel === */}
      <div className="flex items-center justify-center p-6 lg:p-12 relative">
        <div className="absolute inset-0 bg-paper opacity-30 pointer-events-none lg:hidden" />

        <div className="w-full max-w-md space-y-7 animate-fade-up relative">
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden flex items-center gap-2.5 justify-center font-semibold">
            <GoalQuestMark className="h-8 w-8" />
            <span className="text-[15px]">GoalQuest</span>
          </Link>

          <div>
            <div className="chip mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Demo ready · No setup
            </div>
            <h1 className="display-heading text-4xl font-bold text-slate-900">
              Welcome back.
            </h1>
            <p className="text-slate-600 mt-2 text-[15px]">
              Sign in with your credentials or jump straight into a role below.
            </p>
          </div>

          <LoginForm accounts={accounts} />

          <p className="text-center text-[12px] text-slate-500">
            Every seeded account uses the password{" "}
            <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">demo1234</code>
          </p>
        </div>
      </div>
    </div>
  );
}

function MiniRow({ color, label, pct }: { color: string; label: string; pct: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`h-5 w-5 rounded-md ${color} grid place-items-center flex-shrink-0`}>
        <Target className="h-2.5 w-2.5 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] text-slate-700 truncate">{label}</div>
        <div className="h-1 mt-1 bg-slate-200 rounded-full overflow-hidden">
          <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
        </div>
      </div>
      <span className="text-[10px] font-mono text-slate-600 flex-shrink-0">{pct}%</span>
    </div>
  );
}
