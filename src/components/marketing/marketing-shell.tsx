import Link from "next/link";
import { GoalQuestMark } from "@/components/brand/goalquest-mark";

/**
 * Shared shell for all public marketing pages.
 * Apple-style: minimal sticky header, clean footer, max-width content.
 */
export function MarketingShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-canvas text-slate-900">
      <MarketingHeader />
      <main>{children}</main>
      <MarketingFooter />
    </div>
  );
}

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <GoalQuestMark className="h-8 w-8" />
          <span className="text-[15px]">GoalQuest</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-[13px] text-slate-600">
          <Link href="/#features" className="hover:text-slate-900 transition-colors">Features</Link>
          <Link href="/pricing" className="hover:text-slate-900 transition-colors">Pricing</Link>
          <Link href="/security" className="hover:text-slate-900 transition-colors">Security</Link>
          <Link href="/about" className="hover:text-slate-900 transition-colors">About</Link>
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
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-slate-200/60 mt-24 py-12">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
        <div>
          <Link href="/" className="flex items-center gap-2.5 font-semibold">
            <GoalQuestMark className="h-7 w-7" />
            <span className="text-[14px]">GoalQuest</span>
          </Link>
          <p className="text-[12px] text-slate-500 mt-3 max-w-[200px]">
            Audit-ready performance management for modern teams.
          </p>
        </div>
        <FooterCol
          title="Product"
          links={[
            { href: "/#features", label: "Features" },
            { href: "/#workflow", label: "Workflow" },
            { href: "/pricing", label: "Pricing" },
            { href: "/login", label: "Demo" },
          ]}
        />
        <FooterCol
          title="Company"
          links={[
            { href: "/about", label: "About" },
            { href: "/security", label: "Security" },
            { href: "/privacy", label: "Privacy" },
            { href: "/terms", label: "Terms" },
          ]}
        />
        <FooterCol
          title="Resources"
          links={[
            { href: "https://github.com/NoumanS-20/goalquest", label: "GitHub" },
            { href: "/api/health", label: "Status" },
          ]}
        />
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-10 pt-6 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-[12px] text-slate-500">
          © {new Date().getFullYear()} GoalQuest. All rights reserved.
        </p>
        <p className="text-[12px] text-slate-400">
          Built with Next.js, Prisma & Tailwind
        </p>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: Array<{ href: string; label: string }>;
}) {
  return (
    <div>
      <h4 className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-semibold mb-3">
        {title}
      </h4>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="text-[13px] text-slate-700 hover:text-slate-900"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
