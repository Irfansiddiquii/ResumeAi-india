import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnalyzeWidget } from "@/components/analyze/analyze-widget";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { FaqSection } from "@/components/marketing/faq-section";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = buildMetadata({
  title: `${siteConfig.name} — Free ATS Resume Checker & Analyzer`,
  description: siteConfig.description,
  path: "/",
});

const homeFaqs = [
  {
    question: "Is ResumeAI India really free?",
    answer:
      "Yes. You can upload your resume, get your ATS score, see missing keywords, read suggestions and download a report — all without paying or creating an account.",
  },
  {
    question: "Do I need to create an account?",
    answer:
      "No. The entire analysis works without login. You can optionally create a free account later to save your reports and track progress.",
  },
  {
    question: "Which file formats can I upload?",
    answer: "You can upload PDF and DOCX resumes up to 5 MB in size.",
  },
  {
    question: "Is my data safe?",
    answer:
      "We process your resume to generate the analysis and, for anonymous users, we do not store your raw resume text — only the analysis output is kept in your browser for the session.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.4] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <div className="container relative grid items-center gap-10 py-14 md:grid-cols-2 md:py-20">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              <Zap className="h-3.5 w-3.5 text-primary" />
              100% free · No login required
            </span>
            <h1 className="mt-4 text-balance text-4xl font-bold tracking-tight md:text-5xl">
              Is your resume good enough to beat the{" "}
              <span className="text-primary">ATS?</span>
            </h1>
            <p className="mt-4 max-w-md text-balance text-lg text-muted-foreground">
              Upload your resume and get an instant ATS score, missing keywords,
              a job-match percentage and AI-powered fixes — free, in seconds.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/analyze">Analyze Resume Free</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/analyze">Upload Resume</Link>
              </Button>
            </div>

            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-success" /> No sign-up
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-success" /> No payment
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-success" /> Privacy-first
              </li>
            </ul>
          </div>

          {/* Inline analyzer */}
          <div className="rounded-2xl border bg-card p-5 shadow-lg md:p-6">
            <h2 className="mb-4 text-center text-sm font-semibold text-muted-foreground">
              Try it now — upload your resume
            </h2>
            <AnalyzeWidget compact />
          </div>
        </div>
      </section>

      <FeatureGrid />
      <HowItWorks />
      <FaqSection faqs={homeFaqs} id="home-faq" />

      {/* Final CTA */}
      <section className="border-t bg-primary/5">
        <div className="container py-16 text-center md:py-20">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Ready to fix your resume?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Get your free ATS score in seconds. No account, no payment, no
            catch.
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link href="/analyze">Analyze Resume Free</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
