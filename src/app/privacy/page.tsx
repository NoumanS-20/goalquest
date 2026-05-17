import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description:
    "How GoalQuest collects, uses, and protects your data. Plain-English privacy policy aligned with GDPR.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <article className="max-w-3xl mx-auto px-6 py-24 prose prose-slate">
        <h1 className="display-heading text-5xl font-bold text-slate-900 mb-3">
          Privacy Policy
        </h1>
        <p className="text-[13px] text-slate-500 mb-12">
          Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <section className="space-y-6 text-[15px] text-slate-700 leading-relaxed">
          <p>
            This Privacy Policy explains how GoalQuest ("we", "us") collects,
            uses, and shares your personal data when you use our service.
          </p>

          <h2 className="display-heading text-2xl font-bold text-slate-900 mt-10">
            1. What we collect
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Account data:</strong> your name, email, role, department, and (if you log in via Microsoft) your Entra ID identifier.</li>
            <li><strong>Goal data:</strong> the goals, targets, check-ins, comments, and audit history you create.</li>
            <li><strong>Usage data:</strong> IP address, browser, pages visited, and timestamps — used for security and reliability.</li>
            <li><strong>Cookies:</strong> a single session cookie (HTTP-only, Secure, SameSite=Lax) for authentication.</li>
          </ul>

          <h2 className="display-heading text-2xl font-bold text-slate-900 mt-10">
            2. How we use it
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>To provide the service — store and retrieve your goals, surface analytics, send notifications.</li>
            <li>To keep the service safe — detect abuse, rate-limit, investigate security incidents.</li>
            <li>To improve the product — anonymised aggregate metrics only.</li>
          </ul>
          <p>
            We <strong>do not</strong> sell your data, profile you for advertising, or share it with
            third parties for marketing.
          </p>

          <h2 className="display-heading text-2xl font-bold text-slate-900 mt-10">
            3. Subprocessors
          </h2>
          <p>We rely on the following processors to run GoalQuest:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Vercel</strong> — hosting and content delivery</li>
            <li><strong>Neon</strong> — managed Postgres database</li>
            <li><strong>Sentry</strong> — error tracking</li>
            <li><strong>Resend</strong> — transactional email</li>
          </ul>

          <h2 className="display-heading text-2xl font-bold text-slate-900 mt-10">
            4. Your rights (GDPR)
          </h2>
          <p>
            If you are in the EU, EEA, or UK, you have the right to access,
            correct, delete, export, or restrict processing of your data. Email
            us at <a className="text-blue-600 hover:underline" href="mailto:privacy@goalquest.app">privacy@goalquest.app</a> and
            we'll respond within 30 days.
          </p>

          <h2 className="display-heading text-2xl font-bold text-slate-900 mt-10">
            5. Retention
          </h2>
          <p>
            We keep your account data while your account is active and for 30 days
            after deletion. Audit logs are retained for 7 years to support
            compliance and dispute resolution.
          </p>

          <h2 className="display-heading text-2xl font-bold text-slate-900 mt-10">
            6. Contact
          </h2>
          <p>
            Questions? Email <a className="text-blue-600 hover:underline" href="mailto:privacy@goalquest.app">privacy@goalquest.app</a>.
          </p>
        </section>
      </article>
    </MarketingShell>
  );
}
