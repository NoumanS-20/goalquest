import type { Metadata } from "next";
import { Lock, ShieldCheck, KeyRound, Server, Activity, FileText, Eye, Database } from "lucide-react";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Security",
  description:
    "GoalQuest is built with security and privacy first. TLS, argon2id password hashing, full audit trail, role-based access, and OWASP-aligned defenses.",
  path: "/security",
});

const pillars = [
  {
    icon: Lock,
    title: "Encryption everywhere",
    body: "TLS 1.2+ for every connection. Data at rest encrypted with AES-256. Passwords hashed with argon2id (OWASP 2024 parameters).",
  },
  {
    icon: KeyRound,
    title: "Modern authentication",
    body: "HTTP-only, secure, SameSite=Lax session cookies. Rate-limited login. Microsoft Entra ID SSO available on Business and Enterprise.",
  },
  {
    icon: ShieldCheck,
    title: "Defense in depth",
    body: "Strict CSP, HSTS preload, X-Frame-Options DENY, Origin-checked CSRF, per-request IDs for forensic correlation.",
  },
  {
    icon: Eye,
    title: "Complete audit trail",
    body: "Every change to every goal is captured — actor, field, old value, new value, timestamp. Immutable. Exportable. Queryable.",
  },
  {
    icon: Server,
    title: "Resilient infrastructure",
    body: "Hosted on Vercel's global edge with autoscaling. Postgres on Neon with point-in-time restore. 99.9% uptime SLA on Enterprise.",
  },
  {
    icon: Activity,
    title: "Continuous monitoring",
    body: "Real-time error tracking via Sentry. Structured JSON logs. Uptime monitoring across multiple regions. Health-check endpoint at /api/health.",
  },
  {
    icon: Database,
    title: "Your data, your tenant",
    body: "Logical isolation per tenant. Data export available at any time. Right to deletion honored within 30 days.",
  },
  {
    icon: FileText,
    title: "Compliance roadmap",
    body: "SOC 2 Type I scheduled Q4 2026. GDPR-ready data processing addendum (DPA) available on request. SLA-backed incident response.",
  },
];

export default function SecurityPage() {
  return (
    <MarketingShell>
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="chip mb-5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          Security & Trust
        </div>
        <h1 className="display-heading text-5xl sm:text-6xl font-bold text-slate-900 max-w-3xl mx-auto">
          Built for trust,
          <br />
          <span className="text-slate-400">audited end-to-end.</span>
        </h1>
        <p className="mt-6 text-[17px] text-slate-600 max-w-2xl mx-auto">
          GoalQuest is engineered to be production-grade from the first commit.
          Here's how we keep your goal data safe.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-soft hover:shadow-soft-lg transition-all"
            >
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 grid place-items-center mb-4 shadow-soft">
                <p.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900 text-[15px]">{p.title}</h3>
              <p className="text-[13px] text-slate-600 mt-2 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-16">
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-10 text-white text-center">
          <h2 className="display-heading text-3xl font-bold">
            Need our security questionnaire?
          </h2>
          <p className="text-slate-300 mt-4 max-w-md mx-auto">
            We've answered the Vendor Security Alliance Core, CAIQ, and most
            common enterprise InfoSec questionnaires. Request the latest copy.
          </p>
          <a
            href="mailto:security@goalquest.app"
            className="mt-7 inline-flex bg-white text-slate-900 hover:bg-slate-100 text-[14px] font-medium px-6 py-3 rounded-full transition-colors"
          >
            Request security pack
          </a>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-24">
        <h2 className="display-heading text-2xl font-bold text-slate-900 mb-6">
          Responsible disclosure
        </h2>
        <p className="text-[14px] text-slate-600 leading-relaxed">
          Found a vulnerability? We take responsible disclosure seriously.
          Please email <a className="text-blue-600 hover:underline" href="mailto:security@goalquest.app">security@goalquest.app</a> with a
          detailed report. We commit to acknowledging within 24 hours and
          patching critical issues within 7 days. We do not currently run a
          paid bug bounty but happily provide credit and swag.
        </p>
      </section>
    </MarketingShell>
  );
}
