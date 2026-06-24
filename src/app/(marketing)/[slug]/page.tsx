import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnalyzeWidget } from "@/components/analyze/analyze-widget";
import { FaqSection } from "@/components/marketing/faq-section";
import { getSeoPage, seoPages } from "@/config/seo-pages";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";

export function generateStaticParams() {
  return seoPages.map((p) => ({ slug: p.slug }));
}

// Unknown slugs should 404 rather than render an empty page.
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getSeoPage(slug);
  if (!page) return {};
  return buildMetadata({
    title: page.title,
    description: page.description,
    path: `/${page.slug}`,
    keywords: page.keywords,
  });
}

export default async function SeoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getSeoPage(slug);
  if (!page) notFound();

  return (
    <>
      <section className="relative overflow-hidden border-b">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.4] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <div className="container relative grid items-center gap-10 py-12 md:grid-cols-2 md:py-16">
          <div>
            <h1 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
              {page.h1}
            </h1>
            <p className="mt-4 max-w-md text-balance text-lg text-muted-foreground">
              {page.intro}
            </p>
            <div className="mt-6">
              <Button asChild size="lg">
                <Link href="/analyze">Analyze Resume Free</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-2xl border bg-card p-5 shadow-lg md:p-6">
            <AnalyzeWidget compact />
          </div>
        </div>
      </section>

      <section className="container py-16 md:py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {page.benefits.map((b) => (
            <div key={b.title} className="rounded-xl border bg-card p-6 shadow-sm">
              <CheckCircle2 className="h-6 w-6 text-primary" />
              <h2 className="mt-3 text-lg font-semibold">{b.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{b.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-xl border bg-muted/30 p-6">
          <p className="text-sm font-medium">Explore more free tools</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {seoPages
              .filter((p) => p.slug !== page.slug)
              .map((p) => (
                <Link
                  key={p.slug}
                  href={`/${p.slug}`}
                  className="inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1 text-sm transition-colors hover:border-primary hover:text-primary"
                >
                  {p.navLabel}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              ))}
          </div>
        </div>
      </section>

      <FaqSection faqs={page.faqs} id={`faq-${page.slug}`} />

      <Script
        id={`ld-breadcrumb-${page.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: page.navLabel, path: `/${page.slug}` },
            ])
          ),
        }}
      />
    </>
  );
}
