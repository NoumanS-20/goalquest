/**
 * Central SEO config. All public-facing metadata flows through here so
 * brand changes (name, tagline, default OG copy) happen in one place.
 */

import type { Metadata } from "next";

export const SITE = {
  name: "GoalQuest",
  shortName: "GoalQuest",
  tagline: "Set goals, track wins, all in one place.",
  description:
    "GoalQuest is the modern, audit-ready performance portal that replaces spreadsheets. Draft, align, approve, check in, and report — without the sprawl.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://goalquest.app",
  twitter: "@goalquest",
  // Default OG image — generated dynamically at /api/og
  ogImage: "/api/og",
  themeColor: "#0f172a",
  locale: "en_US",
};

export function absoluteUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return new URL(path, SITE.url).toString();
}

type BuildMetaOpts = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
};

/**
 * Build a complete Next.js Metadata object for a route, with sensible
 * defaults and consistent OG / Twitter card output.
 */
export function buildMetadata(opts: BuildMetaOpts = {}): Metadata {
  const title = opts.title
    ? `${opts.title} · ${SITE.name}`
    : `${SITE.name} — ${SITE.tagline}`;
  const description = opts.description ?? SITE.description;
  const url = opts.path ? absoluteUrl(opts.path) : SITE.url;
  const image = absoluteUrl(opts.image ?? SITE.ogImage);

  return {
    title,
    description,
    metadataBase: new URL(SITE.url),
    alternates: { canonical: url },
    robots: opts.noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, "max-image-preview": "large" },
        },
    openGraph: {
      type: "website",
      locale: SITE.locale,
      url,
      siteName: SITE.name,
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: SITE.name }],
    },
    twitter: {
      card: "summary_large_image",
      site: SITE.twitter,
      creator: SITE.twitter,
      title,
      description,
      images: [image],
    },
    applicationName: SITE.name,
    keywords: [
      "goal setting",
      "OKR",
      "performance management",
      "quarterly check-ins",
      "manager approval workflow",
      "audit trail",
      "HR portal",
      "AtomQuest",
    ],
    authors: [{ name: "GoalQuest" }],
    creator: SITE.name,
    publisher: SITE.name,
  };
}

/**
 * JSON-LD structured data for the home page.
 * Helps search engines surface rich results.
 */
export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE.name,
    description: SITE.description,
    url: SITE.url,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
      logo: absoluteUrl("/icon.png"),
    },
  };
}

export function buildFAQJsonLd(faqs: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
