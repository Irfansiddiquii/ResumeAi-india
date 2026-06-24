import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

interface PageSeo {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
}

/** Build per-page Next.js Metadata with sensible, SEO-friendly defaults. */
export function buildMetadata({
  title,
  description,
  path = "/",
  keywords = [],
}: PageSeo): Metadata {
  const url = new URL(path, siteConfig.url).toString();
  const fullTitle =
    path === "/" ? title : `${title} | ${siteConfig.shortName}`;

  return {
    title: fullTitle,
    description,
    keywords: [...siteConfig.keywords, ...keywords],
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      siteName: siteConfig.name,
      title: fullTitle,
      description,
      locale: siteConfig.locale,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}

/** JSON-LD for the tool itself (SoftwareApplication). */
export function softwareAppJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    description: siteConfig.description,
    url: siteConfig.url,
  };
}

/** JSON-LD for an FAQ section. */
export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

/** JSON-LD breadcrumbs. */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: new URL(item.path, siteConfig.url).toString(),
    })),
  };
}
