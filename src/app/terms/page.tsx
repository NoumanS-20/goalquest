import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Terms of Service",
  description: "The terms governing your use of GoalQuest.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <MarketingShell>
      <article className="max-w-3xl mx-auto px-6 py-24">
        <h1 className="display-heading text-5xl font-bold text-slate-900 mb-3">
          Terms of Service
        </h1>
        <p className="text-[13px] text-slate-500 mb-12">
          Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <section className="space-y-6 text-[15px] text-slate-700 leading-relaxed">
          <p>
            By using GoalQuest, you agree to these Terms of Service. If you
            don't agree, please don't use the service.
          </p>

          <h2 className="display-heading text-2xl font-bold text-slate-900 mt-10">
            1. Your account
          </h2>
          <p>
            You're responsible for keeping your credentials secure. You must be
            at least 16 years old to use GoalQuest. One person per account.
          </p>

          <h2 className="display-heading text-2xl font-bold text-slate-900 mt-10">
            2. Acceptable use
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>No reverse-engineering or scraping the service.</li>
            <li>No uploading malware, illegal content, or content that violates someone else's rights.</li>
            <li>No use that would overload our infrastructure or interfere with other users.</li>
          </ul>

          <h2 className="display-heading text-2xl font-bold text-slate-900 mt-10">
            3. Your content
          </h2>
          <p>
            You own the goals, check-ins, and comments you create. You grant
            us the limited license needed to host, display, back up, and
            process them to provide the service. We never claim ownership.
          </p>

          <h2 className="display-heading text-2xl font-bold text-slate-900 mt-10">
            4. Subscriptions
          </h2>
          <p>
            Paid plans renew automatically. Cancel any time from your account
            settings; you'll keep access until the end of the billing period.
            No refunds for partial periods unless required by law.
          </p>

          <h2 className="display-heading text-2xl font-bold text-slate-900 mt-10">
            5. Service availability
          </h2>
          <p>
            We aim for high availability but don't guarantee the service will
            be uninterrupted. Enterprise plans include a 99.9% uptime SLA with
            credits for downtime — see your order form for specifics.
          </p>

          <h2 className="display-heading text-2xl font-bold text-slate-900 mt-10">
            6. Liability
          </h2>
          <p>
            To the maximum extent permitted by law, our total liability is
            capped at the amount you paid us in the preceding 12 months. We're
            not liable for indirect or consequential damages.
          </p>

          <h2 className="display-heading text-2xl font-bold text-slate-900 mt-10">
            7. Changes
          </h2>
          <p>
            We may update these terms occasionally. We'll notify you of
            material changes at least 30 days in advance via email.
          </p>

          <h2 className="display-heading text-2xl font-bold text-slate-900 mt-10">
            8. Contact
          </h2>
          <p>
            Questions? Email{" "}
            <a className="text-blue-600 hover:underline" href="mailto:legal@goalquest.app">
              legal@goalquest.app
            </a>
            .
          </p>
        </section>
      </article>
    </MarketingShell>
  );
}
