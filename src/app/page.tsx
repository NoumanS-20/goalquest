import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/lib/session";
import {
  Target,
  Users,
  ShieldCheck,
  BarChart3,
  ClipboardCheck,
  Workflow,
  Bell,
  FileSpreadsheet,
  Zap,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-dot-grid opacity-40" />
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-gradient blur-3xl opacity-20" />
        <div className="absolute top-1/2 -left-32 h-96 w-96 rounded-full bg-brand-gradient blur-3xl opacity-15" />
      </div>

      <header className="border-b border-border/60 backdrop-blur-md bg-background/70 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <div className="h-7 w-7 rounded-md bg-brand-gradient grid place-items-center">
              <Target className="h-4 w-4 text-white" />
            </div>
            <span className="text-base">GoalQuest</span>
            <Badge variant="outline" className="ml-1 text-[10px] tracking-wider uppercase">
              AtomQuest 1.0
            </Badge>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#workflow" className="hover:text-foreground">Workflow</a>
            <a href="#bonus" className="hover:text-foreground">Bonus</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild variant="brand" size="sm">
              <Link href="/login">Try the demo</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="animate-fade-up">
          <Badge variant="outline" className="mb-6 px-3 py-1">
            <Zap className="h-3 w-3 mr-1" />
            Built for AtomQuest Hackathon 1.0
          </Badge>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight">
            Goal setting that{" "}
            <span className="text-brand-gradient">actually ships</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
            One portal for the full lifecycle — draft, align, approve, check-in, and
            report. Audit-ready by default. Designed for employees, managers and HR.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" variant="brand">
              <Link href="/login">
                Launch the demo
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#workflow">See the workflow</a>
            </Button>
          </div>
          <p className="mt-5 text-xs text-muted-foreground">
            Pre-seeded with 3 roles · No signup needed · One-click role switching
          </p>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            { v: "100%", l: "Phase 1+2 covered" },
            { v: "4", l: "UoM types" },
            { v: "3", l: "Role personas" },
            { v: "0", l: "Spreadsheets" },
          ].map((s) => (
            <div key={s.l} className="rounded-xl border border-border bg-card/40 backdrop-blur p-4">
              <div className="text-3xl font-bold text-brand-gradient">{s.v}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Everything the BRD asks for</h2>
          <p className="mt-3 text-muted-foreground">Phase 1, Phase 2, and most of the bonus shelf.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-xl border border-border bg-card p-6 hover:shadow-md hover:border-brand/40 transition-all"
            >
              <div className="h-10 w-10 rounded-lg bg-brand-gradient/10 grid place-items-center mb-4 ring-1 ring-brand/20">
                <f.icon className="h-5 w-5" style={{ color: "hsl(var(--brand))" }} />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="workflow" className="max-w-7xl mx-auto px-6 py-20 border-t border-border/60">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">The full goal lifecycle</h2>
          <p className="mt-3 text-muted-foreground">From May goal-setting through to April annual capture.</p>
        </div>
        <div className="grid md:grid-cols-5 gap-4">
          {workflow.map((w, i) => (
            <div key={w.title} className="relative">
              <div className="rounded-xl border border-border bg-card p-5 h-full">
                <div className="text-xs font-mono text-brand-gradient font-semibold">{w.when}</div>
                <h3 className="font-semibold mt-2">{w.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{w.desc}</p>
              </div>
              {i < workflow.length - 1 && (
                <ArrowRight className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 h-5 w-5 text-muted-foreground/40" />
              )}
            </div>
          ))}
        </div>
      </section>

      <section id="bonus" className="max-w-7xl mx-auto px-6 py-20 border-t border-border/60">
        <div className="text-center mb-12">
          <Badge variant="brand" className="mb-3">Bonus shelf</Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Going beyond the must-have</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {bonus.map((b) => (
            <div key={b} className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{b}</span>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 mt-10">
        <div className="max-w-7xl mx-auto px-6 text-center text-xs text-muted-foreground">
          GoalQuest · An AtomQuest Hackathon 1.0 submission · Built with Next.js, Prisma & Tailwind
        </div>
      </footer>
    </div>
  );
}

const features = [
  { icon: Target, title: "Structured goal-setting", desc: "Thrust area, UoM, target, weightage — enforced at the form level." },
  { icon: ShieldCheck, title: "Validation rules baked-in", desc: "Weightage must equal 100%, min 10% per goal, max 8 goals — guaranteed by the API." },
  { icon: Workflow, title: "Manager approval workflow", desc: "Inline edits, return-for-rework, lock on approve. Admin override available." },
  { icon: Users, title: "Shared / departmental goals", desc: "Push KPIs to multiple reports. Weightage adjustable, title & target read-only." },
  { icon: ClipboardCheck, title: "Quarterly check-ins", desc: "Q1–Q4 windows with score computation across all 4 UoM formulas." },
  { icon: BarChart3, title: "Analytics & heatmaps", desc: "QoQ trends, completion heatmap, thrust-area distribution, manager effectiveness." },
  { icon: FileSpreadsheet, title: "CSV export & audit trail", desc: "Planned vs actual export. Every post-lock change captured." },
  { icon: Bell, title: "Rule-based escalations", desc: "Configurable thresholds. Auto-escalate to manager, then skip-level." },
  { icon: Zap, title: "Sub-second navigation", desc: "Server components, React 19, optimistic UI — built for scale." },
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
