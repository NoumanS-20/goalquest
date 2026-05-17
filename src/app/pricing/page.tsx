import type { Metadata } from "next";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Pricing",
  description:
    "Simple, transparent pricing for teams of every size. Start free, scale when you're ready.",
  path: "/pricing",
});

const plans = [
  {
    name: "Starter",
    price: "$0",
    cadence: "per user / month",
    blurb: "For small teams getting started with structured goal setting.",
    features: [
      "Up to 25 users",
      "Full Phase 1 + Phase 2 workflow",
      "Quarterly check-ins",
      "Basic analytics",
      "CSV export",
      "Email support",
    ],
    cta: "Start free",
    href: "/login",
    featured: false,
  },
  {
    name: "Business",
    price: "$8",
    cadence: "per user / month",
    blurb: "For growing organisations that need full audit trails and SSO.",
    features: [
      "Unlimited users",
      "Microsoft Entra ID SSO",
      "Full audit log retention",
      "Advanced analytics + heatmaps",
      "Rule-based escalations",
      "Email & Teams notifications",
      "Priority support",
    ],
    cta: "Start 14-day trial",
    href: "/login",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "annual contract",
    blurb: "For enterprises with custom security, compliance, and scale needs.",
    features: [
      "Everything in Business",
      "SOC 2 Type II report",
      "Custom data residency",
      "SAML SSO + SCIM",
      "Dedicated CSM",
      "99.9% uptime SLA",
      "Custom legal review",
    ],
    cta: "Talk to sales",
    href: "mailto:sales@goalquest.app",
    featured: false,
  },
];

export default function PricingPage() {
  return (
    <MarketingShell>
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="chip mb-5">
          <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
          Simple pricing · No hidden fees
        </div>
        <h1 className="display-heading text-5xl sm:text-6xl font-bold text-slate-900 max-w-3xl mx-auto">
          Pick the plan
          <br />
          <span className="text-slate-400">that fits your team.</span>
        </h1>
        <p className="mt-6 text-[17px] text-slate-600 max-w-xl mx-auto">
          Start free with up to 25 users. Upgrade when you need SSO, advanced
          analytics, or enterprise compliance.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl border p-8 ${
                plan.featured
                  ? "bg-slate-900 text-white border-slate-900 shadow-soft-lg scale-[1.02]"
                  : "bg-white border-slate-200/80 shadow-soft"
              }`}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full">
                  Most popular
                </span>
              )}
              <h3 className={`text-[14px] font-semibold ${plan.featured ? "text-slate-400" : "text-slate-500"}`}>
                {plan.name}
              </h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="display-heading text-5xl font-bold">{plan.price}</span>
                {plan.price !== "Custom" && (
                  <span className={`text-[13px] ${plan.featured ? "text-slate-400" : "text-slate-500"}`}>
                    /mo
                  </span>
                )}
              </div>
              <p className={`text-[12px] mt-1 ${plan.featured ? "text-slate-400" : "text-slate-500"}`}>
                {plan.cadence}
              </p>
              <p className={`mt-4 text-[14px] ${plan.featured ? "text-slate-200" : "text-slate-700"}`}>
                {plan.blurb}
              </p>

              <Link
                href={plan.href}
                className={`mt-7 inline-flex items-center justify-center w-full text-[14px] font-medium px-5 py-3 rounded-full transition-colors ${
                  plan.featured
                    ? "bg-white text-slate-900 hover:bg-slate-100"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                {plan.cta}
              </Link>

              <ul className="mt-7 space-y-2.5">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className={`flex items-start gap-2 text-[13.5px] ${
                      plan.featured ? "text-slate-200" : "text-slate-700"
                    }`}
                  >
                    <Check
                      className={`h-4 w-4 flex-shrink-0 mt-0.5 ${
                        plan.featured ? "text-emerald-400" : "text-emerald-600"
                      }`}
                    />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-24">
        <h2 className="display-heading text-3xl font-bold text-slate-900 text-center mb-10">
          Frequently asked questions
        </h2>
        <dl className="space-y-6">
          {faqs.map((f) => (
            <div
              key={f.q}
              className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-soft"
            >
              <dt className="font-semibold text-slate-900">{f.q}</dt>
              <dd className="mt-2 text-[14px] text-slate-600 leading-relaxed">
                {f.a}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </MarketingShell>
  );
}

const faqs = [
  {
    q: "How does the free tier work?",
    a: "You get unlimited goals, check-ins, and audit trail entries for up to 25 users — forever. No credit card required to start.",
  },
  {
    q: "Can I switch plans later?",
    a: "Yes. Upgrade or downgrade at any time; we prorate the difference.",
  },
  {
    q: "Do you offer annual discounts?",
    a: "Yes — pay annually and save 20% on Business and Enterprise plans.",
  },
  {
    q: "Is my data secure?",
    a: "Every customer's data lives in an isolated tenant. We use TLS in transit, AES-256 at rest, daily backups, and follow OWASP best practices. See our /security page for details.",
  },
];
