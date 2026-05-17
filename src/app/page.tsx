import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/session";
import { buildMetadata, buildOrganizationJsonLd, buildFAQJsonLd } from "@/lib/seo";
import {
  Target,
  Users,
  ShieldCheck,
  BarChart3,
  ClipboardCheck,
  Workflow,
  Bell,
  FileSpreadsheet,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { GoalQuestMark } from "@/components/brand/goalquest-mark";
import { BrandLogos } from "@/components/brand/brand-logos";

export const metadata: Metadata = buildMetadata({
  title: "Set goals, track wins, all in one place",
  description:
    "GoalQuest is the modern, audit-ready performance portal that replaces spreadsheets. Draft, align, approve, check in, and report — without the sprawl.",
  path: "/",
});

const FAQS = [
  {
    q: "What is GoalQuest?",
    a: "GoalQuest is a goal setting and tracking portal that covers the full annual cycle — drafting, alignment, manager approval, quarterly check-ins, analytics, and audit-ready reporting.",
  },
  {
    q: "What goal types does GoalQuest support?",
    a: "Six units of measurement: numeric (higher or lower is better), percentage (higher or lower is better), timeline (date-based), and zero-based (zero equals success).",
  },
  {
    q: "Is there an audit trail?",
    a: "Yes — every change to every goal is captured with actor, field, old value, new value, and timestamp. Audit logs are immutable and exportable.",
  },
  {
    q: "Can managers approve goals from one place?",
    a: "Yes. The Team console lets managers approve, return for rework, or inline-edit submitted goals, with a structured comment thread per check-in.",
  },
];

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-canvas text-slate-900">
      {/* JSON-LD structured data for rich results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildOrganizationJsonLd()),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildFAQJsonLd(FAQS)),
        }}
      />

      {/* Top nav — Apple style: minimal, centered links */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
            <GoalQuestMark className="h-8 w-8" />
            <span className="text-[15px]">GoalQuest</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-[13px] text-slate-600">
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#workflow" className="hover:text-slate-900 transition-colors">Workflow</a>
            <a href="#roles" className="hover:text-slate-900 transition-colors">Roles</a>
            <a href="#bonus" className="hover:text-slate-900 transition-colors">Beyond</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-[13px] text-slate-700 hover:text-slate-900 px-3 py-1.5">
              Sign in
            </Link>
            <Link
              href="/login"
              className="text-[13px] font-medium bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-full transition-colors"
            >
              Try the demo
            </Link>
          </div>
        </div>
      </header>

      {/* HERO — Apple/ChronoTask style */}
      <section className="relative">
        <div className="absolute inset-0 bg-paper opacity-60 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-24">
          {/* Floating cards — top-left sticky note */}
          <FloatingStickyNote className="hidden md:block absolute left-4 lg:left-12 top-6 lg:top-12 w-[200px] animate-float" />

          {/* Floating cards — top-right reminders */}
          <FloatingReminderCard className="hidden md:block absolute right-4 lg:right-12 top-6 lg:top-10 w-[260px] animate-float-slow" />

          {/* Floating cards — bottom-left task list */}
          <FloatingTaskCard className="hidden lg:block absolute left-2 lg:left-8 bottom-6 w-[300px] animate-float-fast" />

          {/* Floating cards — bottom-right integrations */}
          <FloatingIntegrationsCard className="hidden lg:block absolute right-2 lg:right-8 bottom-6 w-[260px] animate-float" />

          {/* Centered 3D mark above headline */}
          <div className="relative flex flex-col items-center text-center max-w-3xl mx-auto pt-12">
            <div className="relative mb-8">
              <div className="absolute inset-0 -m-6 rounded-3xl bg-gradient-to-br from-indigo-100 via-white to-purple-100 blur-2xl opacity-70" />
              <Hero3DMark />
            </div>

            <h1 className="display-heading text-5xl sm:text-6xl md:text-7xl font-bold text-slate-900">
              Set goals, track wins,
              <br />
              <span className="text-slate-400 font-bold">all in one place.</span>
            </h1>

            <p className="mt-7 text-[17px] sm:text-[18px] text-slate-600 max-w-xl leading-relaxed">
              The performance portal teams actually use. Draft, align, approve, check in,
              and report — without the spreadsheet sprawl.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row gap-3 items-center">
              <Link
                href="/login"
                className="group inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-[15px] font-medium px-7 py-3.5 rounded-full transition-all shadow-soft hover:shadow-soft-lg hover:-translate-y-0.5"
              >
                Get the free demo
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a
                href="#features"
                className="text-[15px] font-medium text-slate-700 hover:text-slate-900 px-5 py-3 inline-flex items-center gap-1"
              >
                See what's inside <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            <p className="mt-5 text-[12px] text-slate-500">
              3 demo roles · No signup · One-click switch between personas
            </p>
          </div>
        </div>

        {/* Trust strip — real software logos */}
        <div className="relative border-y border-slate-200/60 bg-white/60 backdrop-blur-sm py-10">
          <p className="text-center text-[11px] uppercase tracking-[0.2em] text-slate-500 font-medium mb-7">
            Plays nicely with the tools your team already loves
          </p>
          <div className="relative max-w-6xl mx-auto px-6 overflow-hidden">
            <div className="flex gap-14 animate-marquee w-max items-center">
              <BrandLogos />
              <BrandLogos />
            </div>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent" />
          </div>
        </div>
      </section>

      {/* PRODUCT PREVIEW — large showcase card */}
      <section className="relative max-w-7xl mx-auto px-6 py-28">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="chip mb-5">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            One portal · End-to-end
          </div>
          <h2 className="display-heading text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900">
            Built for the whole
            <br />
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              goal lifecycle.
            </span>
          </h2>
          <p className="mt-5 text-[17px] text-slate-600">
            From the first draft in May to the annual capture in April, every step is
            audit-ready, role-aware, and beautifully designed.
          </p>
        </div>

        {/* Big product mockup */}
        <DashboardMockup />
      </section>

      {/* FEATURES — Apple bento grid */}
      <section id="features" className="relative max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <div className="chip mb-5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            Everything the BRD asks for
          </div>
          <h2 className="display-heading text-4xl sm:text-5xl font-bold text-slate-900">
            Features that get out of your way.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <FeatureCard key={f.title} feature={f} large={i === 0} />
          ))}
        </div>
      </section>

      {/* ROLES — three card stack like Apple lineup */}
      <section id="roles" className="relative max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <div className="chip mb-5">
            <Users className="h-3.5 w-3.5 text-blue-500" />
            Designed for three personas
          </div>
          <h2 className="display-heading text-4xl sm:text-5xl font-bold text-slate-900">
            A workspace tuned to every role.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {roles.map((r) => (
            <RoleCard key={r.title} role={r} />
          ))}
        </div>
      </section>

      {/* WORKFLOW — horizontal timeline */}
      <section id="workflow" className="relative max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <div className="chip mb-5">
            <Workflow className="h-3.5 w-3.5 text-purple-500" />
            12-month rhythm
          </div>
          <h2 className="display-heading text-4xl sm:text-5xl font-bold text-slate-900">
            The full annual cycle.
          </h2>
        </div>

        <div className="relative">
          <div className="hidden md:block absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
          <div className="grid md:grid-cols-5 gap-4 relative">
            {workflow.map((w, i) => (
              <div key={w.title} className="relative">
                <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-soft hover:shadow-soft-lg transition-all hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono font-bold tracking-wider text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                      {w.when}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">0{i + 1}</span>
                  </div>
                  <h3 className="font-semibold text-slate-900">{w.title}</h3>
                  <p className="text-[13px] text-slate-600 mt-1.5 leading-relaxed">{w.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BONUS — clean checklist */}
      <section id="bonus" className="relative max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <div className="chip mb-5">
            <TrendingUp className="h-3.5 w-3.5 text-pink-500" />
            Bonus shelf
          </div>
          <h2 className="display-heading text-4xl sm:text-5xl font-bold text-slate-900">
            Going beyond the must-haves.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-3 max-w-4xl mx-auto">
          {bonus.map((b) => (
            <div
              key={b}
              className="flex items-start gap-3.5 rounded-2xl bg-white border border-slate-200/80 p-5 shadow-soft hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors"
            >
              <div className="h-6 w-6 rounded-full bg-emerald-100 grid place-items-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <span className="text-[14px] text-slate-700 leading-relaxed">{b}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA — Apple-style big banner */}
      <section className="relative max-w-7xl mx-auto px-6 pb-24">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-10 py-20 text-center">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
          </div>
          <div className="relative">
            <GoalQuestMark className="h-14 w-14 mx-auto mb-7" inverted />
            <h2 className="display-heading text-4xl sm:text-5xl font-bold text-white max-w-2xl mx-auto">
              See it in action.
              <br />
              <span className="text-slate-400">No setup required.</span>
            </h2>
            <p className="mt-6 text-slate-300 max-w-lg mx-auto text-[16px]">
              Jump in with a pre-seeded demo. Switch between Admin, Manager, and Employee
              with one click.
            </p>
            <div className="mt-9">
              <Link
                href="/login"
                className="group inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-900 text-[15px] font-medium px-8 py-3.5 rounded-full transition-all hover:-translate-y-0.5"
              >
                Launch the demo
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200/60 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <GoalQuestMark className="h-6 w-6" />
            <span className="text-[13px] text-slate-500">
              GoalQuest · AtomQuest Hackathon 1.0
            </span>
          </div>
          <div className="text-[12px] text-slate-400">
            Built with Next.js · Prisma · Tailwind
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ============================= */
/*  Sub-components                */
/* ============================= */

function Hero3DMark() {
  return (
    <div className="relative h-24 w-24">
      {/* Soft shadow plate */}
      <div className="absolute inset-0 rounded-[28%] bg-gradient-to-br from-white to-slate-100 shadow-soft-lg" />
      {/* Inner glass */}
      <div className="absolute inset-1.5 rounded-[26%] bg-gradient-to-br from-white via-white to-slate-50 border border-slate-200/80" />
      {/* Dots arrangement (mirrors the logo) */}
      <div className="absolute inset-0 grid place-items-center">
        <div className="grid grid-cols-2 gap-1.5">
          <div className="h-4 w-4 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 shadow-md" />
          <div className="h-4 w-4 rounded-full bg-slate-900" />
          <div className="h-4 w-4 rounded-full bg-slate-900" />
          <div className="h-4 w-4 rounded-full bg-slate-900" />
        </div>
      </div>
      {/* Highlight */}
      <div className="absolute top-2 left-2 right-8 h-4 rounded-full bg-white/60 blur-md" />
    </div>
  );
}

function FloatingStickyNote({ className }: { className?: string }) {
  return (
    <div
      className={className}
      style={{ ["--tilt" as never]: "-6deg" }}
    >
      <div
        className="relative bg-yellow-200 p-4 shadow-soft-lg rounded-sm"
        style={{ transform: "rotate(-6deg)" }}
      >
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-rose-500 shadow-sm" />
        <p className="text-[13px] text-slate-800 leading-snug" style={{ fontFamily: "'Caveat', 'Segoe Script', cursive" }}>
          Draft Q1 goals before
          <br />
          May 14 — align with
          <br />
          Rohan in 1:1.
        </p>
        <div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-600">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          5 of 8 drafted
        </div>
      </div>
    </div>
  );
}

function FloatingReminderCard({ className }: { className?: string }) {
  return (
    <div className={className} style={{ ["--tilt" as never]: "4deg" }}>
      <div className="glass-card rounded-2xl p-4 shadow-soft-lg" style={{ transform: "rotate(4deg)" }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Reminders</span>
          <Bell className="h-3.5 w-3.5 text-slate-400" />
        </div>
        <div className="space-y-3">
          <div className="flex items-start gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-indigo-100 grid place-items-center flex-shrink-0">
              <ClipboardCheck className="h-3.5 w-3.5 text-indigo-600" />
            </div>
            <div className="min-w-0">
              <div className="text-[12px] font-medium text-slate-900">Q1 Check-in</div>
              <div className="text-[10px] text-slate-500">Due in 3 days</div>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-purple-100 grid place-items-center flex-shrink-0">
              <Users className="h-3.5 w-3.5 text-purple-600" />
            </div>
            <div className="min-w-0">
              <div className="text-[12px] font-medium text-slate-900">Approve · Anika</div>
              <div className="text-[10px] text-slate-500">Submitted yesterday</div>
            </div>
          </div>
          <div className="border-t border-slate-200/60 pt-2.5 flex items-center justify-between">
            <span className="text-[10px] text-slate-500">Today · 13:00</span>
            <span className="text-[10px] font-mono text-emerald-600">On track</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FloatingTaskCard({ className }: { className?: string }) {
  return (
    <div className={className} style={{ ["--tilt" as never]: "-3deg" }}>
      <div className="glass-card rounded-2xl p-4 shadow-soft-lg" style={{ transform: "rotate(-3deg)" }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[12px] font-semibold text-slate-900">This quarter's goals</span>
          <span className="text-[10px] text-slate-400">Q1 · FY26</span>
        </div>
        <div className="space-y-2.5">
          <GoalRowMini color="bg-rose-500" label="Cut churn to under 4%" pct={62} />
          <GoalRowMini color="bg-amber-500" label="Ship Atom Quest v2" pct={88} />
          <GoalRowMini color="bg-sky-500" label="Hire 3 frontend engs" pct={33} />
        </div>
      </div>
    </div>
  );
}

function GoalRowMini({ color, label, pct }: { color: string; label: string; pct: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`h-6 w-6 rounded-md ${color} grid place-items-center flex-shrink-0`}>
        <Target className="h-3 w-3 text-white" />
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

function FloatingIntegrationsCard({ className }: { className?: string }) {
  return (
    <div className={className} style={{ ["--tilt" as never]: "5deg" }}>
      <div className="glass-card rounded-2xl p-5 shadow-soft-lg" style={{ transform: "rotate(5deg)" }}>
        <div className="text-[12px] font-semibold text-slate-900 mb-3">Audit-ready</div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { bg: "bg-blue-500", icon: ShieldCheck },
            { bg: "bg-emerald-500", icon: CheckCircle2 },
            { bg: "bg-purple-500", icon: FileSpreadsheet },
            { bg: "bg-orange-500", icon: Workflow },
            { bg: "bg-pink-500", icon: BarChart3 },
            { bg: "bg-indigo-500", icon: Bell },
          ].map((cell, i) => (
            <div
              key={i}
              className={`h-12 w-12 rounded-xl ${cell.bg} grid place-items-center shadow-soft`}
            >
              <cell.icon className="h-5 w-5 text-white" />
            </div>
          ))}
        </div>
        <div className="mt-3 text-[10px] text-slate-500">
          Every change · Who · When · Old → new
        </div>
      </div>
    </div>
  );
}

function DashboardMockup() {
  return (
    <div className="relative">
      {/* Backdrop glow */}
      <div className="absolute -inset-8 bg-gradient-to-br from-indigo-100/40 via-purple-100/30 to-pink-100/40 blur-3xl rounded-[3rem]" />

      <div className="relative rounded-[2rem] bg-white border border-slate-200/80 shadow-soft-lg overflow-hidden">
        {/* Window chrome */}
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-200/60 bg-slate-50/60">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-amber-400" />
            <div className="h-3 w-3 rounded-full bg-emerald-400" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-3 py-1 rounded-md bg-white border border-slate-200/80 text-[11px] text-slate-500 font-mono">
              goalquest.app/dashboard
            </div>
          </div>
        </div>

        {/* Dashboard body */}
        <div className="grid md:grid-cols-[220px_1fr] min-h-[460px]">
          {/* Sidebar */}
          <div className="hidden md:block border-r border-slate-200/60 bg-slate-50/30 p-4 space-y-1">
            <div className="flex items-center gap-2 mb-5 px-2">
              <GoalQuestMark className="h-7 w-7" />
              <span className="text-[13px] font-semibold">GoalQuest</span>
            </div>
            {[
              { label: "Dashboard", active: true, icon: BarChart3 },
              { label: "My goals", icon: Target },
              { label: "Check-ins", icon: ClipboardCheck },
              { label: "Team", icon: Users },
              { label: "Analytics", icon: TrendingUp },
              { label: "Audit", icon: ShieldCheck },
            ].map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] ${
                  item.active
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </div>
            ))}
          </div>

          {/* Main panel */}
          <div className="p-6 space-y-5">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">Q1 · FY 2026-27</div>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">Welcome back, Kabir</h3>
              </div>
              <div className="hidden sm:flex gap-2">
                <div className="chip">5 goals approved</div>
                <div className="chip">Avg score 87%</div>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { label: "Approved", val: "5/8", tone: "from-emerald-500 to-teal-500" },
                { label: "On track", val: "73%", tone: "from-indigo-500 to-blue-500" },
                { label: "Avg score", val: "87%", tone: "from-purple-500 to-pink-500" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl bg-white border border-slate-200/80 p-4 shadow-soft">
                  <div className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">{stat.label}</div>
                  <div className={`text-2xl font-bold bg-gradient-to-r ${stat.tone} bg-clip-text text-transparent mt-1`}>
                    {stat.val}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-slate-200/80 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200/60 bg-slate-50/50 text-[12px] font-semibold text-slate-700">
                Your goals
              </div>
              <div className="divide-y divide-slate-100">
                {[
                  { name: "Cut customer churn to under 4%", uom: "MIN %", w: 25, score: 92, color: "bg-emerald-500" },
                  { name: "Ship Atom Quest v2 by Aug", uom: "TIMELINE", w: 20, score: 100, color: "bg-blue-500" },
                  { name: "Achieve NPS of 60+", uom: "MIN NUM", w: 20, score: 78, color: "bg-purple-500" },
                  { name: "Zero P1 incidents", uom: "ZERO", w: 15, score: 100, color: "bg-rose-500" },
                ].map((row) => (
                  <div key={row.name} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50/50">
                    <div className={`h-2 w-2 rounded-full ${row.color}`} />
                    <div className="flex-1 text-[13px] text-slate-700 truncate">{row.name}</div>
                    <div className="hidden sm:block text-[10px] font-mono text-slate-500 w-16">{row.uom}</div>
                    <div className="text-[11px] text-slate-500 w-10">{row.w}%</div>
                    <div className="text-[12px] font-semibold text-slate-900 w-12 text-right">{row.score}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  feature,
  large,
}: {
  feature: { icon: typeof Target; title: string; desc: string; tone: string };
  large?: boolean;
}) {
  return (
    <div
      className={`group relative rounded-2xl bg-white border border-slate-200/80 p-6 shadow-soft hover:shadow-soft-lg hover:-translate-y-1 transition-all overflow-hidden ${
        large ? "md:col-span-2 lg:col-span-1" : ""
      }`}
    >
      <div className={`absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br ${feature.tone} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />
      <div className={`relative h-11 w-11 rounded-xl bg-gradient-to-br ${feature.tone} grid place-items-center mb-5 shadow-soft`}>
        <feature.icon className="h-5 w-5 text-white" />
      </div>
      <h3 className="relative font-semibold text-slate-900 text-[15px]">{feature.title}</h3>
      <p className="relative text-[13.5px] text-slate-600 mt-1.5 leading-relaxed">{feature.desc}</p>
    </div>
  );
}

function RoleCard({ role }: { role: { title: string; desc: string; perks: string[]; tone: string; accent: string } }) {
  return (
    <div className={`relative rounded-3xl overflow-hidden border border-slate-200/80 shadow-soft hover:shadow-soft-lg transition-all p-8 ${role.tone}`}>
      <div className={`text-[11px] font-bold uppercase tracking-wider ${role.accent}`}>{role.title}</div>
      <h3 className="display-heading text-3xl font-bold text-slate-900 mt-3">{role.desc}</h3>
      <ul className="mt-6 space-y-2.5">
        {role.perks.map((p) => (
          <li key={p} className="flex items-start gap-2 text-[13.5px] text-slate-700">
            <CheckCircle2 className={`h-4 w-4 flex-shrink-0 mt-0.5 ${role.accent}`} />
            {p}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ============================= */
/*  Data                          */
/* ============================= */

const features = [
  {
    icon: Target,
    title: "Structured goal-setting",
    desc: "Thrust area, UoM, target, weightage — enforced at the form level.",
    tone: "from-indigo-500 to-blue-500",
  },
  {
    icon: ShieldCheck,
    title: "Validation rules baked-in",
    desc: "Weightage = 100%, min 10% per goal, max 8 goals — guaranteed by the API.",
    tone: "from-emerald-500 to-teal-500",
  },
  {
    icon: Workflow,
    title: "Manager approval workflow",
    desc: "Inline edits, return-for-rework, lock on approve. Admin override available.",
    tone: "from-purple-500 to-fuchsia-500",
  },
  {
    icon: Users,
    title: "Shared / departmental goals",
    desc: "Push KPIs to multiple reports. Weightage adjustable, title & target read-only.",
    tone: "from-amber-500 to-orange-500",
  },
  {
    icon: ClipboardCheck,
    title: "Quarterly check-ins",
    desc: "Q1–Q4 windows with score computation across all UoM formulas.",
    tone: "from-rose-500 to-pink-500",
  },
  {
    icon: BarChart3,
    title: "Analytics & heatmaps",
    desc: "QoQ trends, completion heatmap, thrust-area distribution, manager scoreboard.",
    tone: "from-sky-500 to-cyan-500",
  },
  {
    icon: FileSpreadsheet,
    title: "CSV export & audit trail",
    desc: "Planned vs actual export. Every post-lock change captured with actor + diff.",
    tone: "from-violet-500 to-purple-500",
  },
  {
    icon: Bell,
    title: "Rule-based escalations",
    desc: "Configurable thresholds. Auto-escalate to manager, then skip-level.",
    tone: "from-red-500 to-rose-500",
  },
  {
    icon: TrendingUp,
    title: "Sub-second navigation",
    desc: "Server components, React 19, optimistic UI — built to scale.",
    tone: "from-lime-500 to-emerald-500",
  },
];

const roles = [
  {
    title: "Employee",
    desc: "Plan your year, in your words.",
    perks: [
      "Draft up to 8 goals with weightages",
      "Log quarterly progress in seconds",
      "See your live score as you type",
      "Comment thread with your manager",
    ],
    tone: "bg-gradient-to-br from-sky-50 via-blue-50 to-white",
    accent: "text-sky-600",
  },
  {
    title: "Manager",
    desc: "Coach your team, end-to-end.",
    perks: [
      "Approve, edit, or return with notes",
      "Push shared goals to the whole team",
      "Check-in comments inline with data",
      "Effectiveness scoreboard built-in",
    ],
    tone: "bg-gradient-to-br from-purple-50 via-fuchsia-50 to-white",
    accent: "text-purple-600",
  },
  {
    title: "Admin / HR",
    desc: "Govern the cycle with confidence.",
    perks: [
      "Configure cycles & escalation rules",
      "Unlock goals with full audit trail",
      "Org-wide analytics & heatmaps",
      "Export CSV achievement reports",
    ],
    tone: "bg-gradient-to-br from-emerald-50 via-teal-50 to-white",
    accent: "text-emerald-600",
  },
];

const workflow = [
  { when: "01 MAY", title: "Goal Setting", desc: "Employees draft and submit goal sheets." },
  { when: "JUL", title: "Q1 Check-in", desc: "Log planned vs actual achievement." },
  { when: "OCT", title: "Q2 Check-in", desc: "Mid-year progress review." },
  { when: "JAN", title: "Q3 Check-in", desc: "Course correct for the year." },
  { when: "MAR / APR", title: "Q4 / Annual", desc: "Final achievement capture." },
];

const bonus = [
  "Real-time analytics with heatmaps & QoQ trend lines",
  "Configurable rule-based escalation engine",
  "Complete audit trail with actor, field, old/new values",
  "Exportable Achievement Report (CSV)",
  "Manager effectiveness dashboard",
  "Goal distribution by thrust area, UoM and status",
  "Polished light/dark theme with brand gradient",
  "Notification centre + scheduled escalation runner",
];
