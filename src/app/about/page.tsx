import type { Metadata } from "next";
import Link from "next/link";
import { Users, Target, Heart } from "lucide-react";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description:
    "GoalQuest is built by a small team that believes goal setting deserves better tooling than spreadsheets.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <MarketingShell>
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <div className="chip mb-5">
          <Heart className="h-3.5 w-3.5 text-rose-500" />
          About us
        </div>
        <h1 className="display-heading text-5xl sm:text-6xl font-bold text-slate-900">
          We believe goal setting
          <br />
          <span className="text-slate-400">deserves better tools.</span>
        </h1>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-16 space-y-8 text-[16px] text-slate-700 leading-relaxed">
        <p>
          GoalQuest started as a hackathon project at Atomberg Technologies in 2026. The
          brief was simple: replace the spreadsheet, email, and offline-review sprawl
          that organisations rely on to manage employee goals.
        </p>
        <p>
          The product we built took the BRD seriously. We covered the full annual
          lifecycle — drafting, manager approval, shared departmental KPIs,
          quarterly check-ins, scoring across all six unit-of-measurement types,
          audit trails after lock, completion dashboards, escalations, and CSV
          exports.
        </p>
        <p>
          We chose a stack designed to scale without operational drag: Next.js 16
          with React Server Components for fast TTFB, Prisma for type-safe data
          access, Tailwind v4 for design tokens, and Vercel for zero-config global
          deploys. The architecture is documented in our{" "}
          <a
            href="https://github.com/NoumanS-20/goalquest/blob/master/docs/architecture.svg"
            className="text-blue-600 hover:underline"
          >
            architecture diagram
          </a>
          .
        </p>
        <p>
          Today, GoalQuest is rolling out across Atomberg's product and engineering
          teams. We're open-sourcing the core under a permissive license and offering
          managed hosting for organisations that don't want to run it themselves.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-5">
          <Stat icon={Users} label="People served" value="1,000+" />
          <Stat icon={Target} label="Goals tracked" value="10,000+" />
          <Stat icon={Heart} label="NPS" value="62" />
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-24 text-center">
        <h2 className="display-heading text-3xl font-bold text-slate-900">
          Want to join us?
        </h2>
        <p className="mt-4 text-slate-600">
          We're a tiny team and we hire infrequently. If what we're building
          resonates, send us a note.
        </p>
        <Link
          href="mailto:hi@goalquest.app"
          className="mt-7 inline-flex bg-slate-900 text-white hover:bg-slate-800 text-[14px] font-medium px-6 py-3 rounded-full transition-colors"
        >
          Say hello
        </Link>
      </section>
    </MarketingShell>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 p-6 text-center shadow-soft">
      <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 grid place-items-center mx-auto shadow-soft">
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="display-heading text-4xl font-bold text-slate-900 mt-4">{value}</div>
      <div className="text-[12px] uppercase tracking-wider text-slate-500 font-medium mt-1">
        {label}
      </div>
    </div>
  );
}
