import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const trust = ["No sign-up", "No payment", "Privacy-first", "Built for India"];

function ProductShot() {
  return (
    <div className="relative mx-auto mt-14 max-w-4xl">
      <div className="absolute -inset-1 rounded-[22px] bg-gradient-to-tr from-primary/50 via-violet/30 to-transparent opacity-60 blur-2xl" />
      <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-b from-[#0e1117] to-[#0b0d12] shadow-[0_40px_90px_-30px_rgba(0,0,0,.9)]">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          <span className="ml-2 text-xs text-muted-foreground">
            {siteConfig.url.replace(/^https?:\/\//, "")}/result
          </span>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
          {/* score card */}
          <div className="flex items-center gap-5 rounded-xl border border-border bg-card p-5">
            <div className="relative h-32 w-32 flex-none">
              <svg viewBox="0 0 128 128" className="h-32 w-32">
                <circle cx="64" cy="64" r="56" fill="none" stroke="hsl(var(--secondary))" strokeWidth="11" />
                <circle
                  cx="64" cy="64" r="56" fill="none" stroke="url(#hg)" strokeWidth="11"
                  strokeLinecap="round" strokeDasharray="351" strokeDashoffset="99"
                  transform="rotate(-90 64 64)"
                />
                <defs>
                  <linearGradient id="hg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#34d399" />
                    <stop offset="1" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold tracking-tight">71</span>
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">ATS Score</span>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-lg border border-success/30 bg-success/15 text-base font-extrabold text-success">B</span>
                <div>
                  <p className="text-sm font-semibold">Good — almost there</p>
                  <p className="text-xs text-muted-foreground">Fix 3 issues to reach A</p>
                </div>
              </div>
              <Bar label="Resume strength" value={62} from="#7c7ff5" to="#a855f7" />
              <Bar label="Job match" value={78} suffix="%" from="#34d399" to="#22d3ee" />
            </div>
          </div>
          {/* keywords card */}
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="mb-3 text-[11px] uppercase tracking-wide text-muted-foreground">Missing keywords</p>
            <div className="flex flex-wrap gap-2">
              {["Kubernetes", "CI/CD", "GraphQL", "Redis"].map((k) => (
                <span key={k} className="rounded-lg border border-destructive/25 bg-destructive/10 px-2.5 py-1 text-xs text-destructive">{k}</span>
              ))}
            </div>
            <p className="mb-3 mt-4 text-[11px] uppercase tracking-wide text-muted-foreground">Matched</p>
            <div className="flex flex-wrap gap-2">
              {["React", "Node.js", "AWS", "PostgreSQL"].map((k) => (
                <span key={k} className="rounded-lg border border-success/25 bg-success/10 px-2.5 py-1 text-xs text-success">{k}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Bar({
  label, value, from, to, suffix = "",
}: { label: string; value: number; from: string; to: string; suffix?: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span>{value}{suffix}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <span className="block h-full rounded-full" style={{ width: `${value}%`, background: `linear-gradient(90deg, ${from}, ${to})` }} />
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px] bg-grid mask-hero opacity-50" />
        <div className="pointer-events-none absolute left-1/2 top-[-220px] h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(124,127,245,.28),transparent)]" />
        <div className="container relative pt-20 pb-10 text-center md:pt-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_10px] shadow-success" />
            Free forever · No login required
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl text-balance text-5xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
            Beat the ATS.{" "}
            <span className="gradient-text">Land the interview.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-balance text-lg text-muted-foreground">
            Upload your resume and get an instant ATS score, missing keywords, a
            job-match percentage and AI-powered fixes — free, in seconds.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/analyze">Analyze Resume Free →</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/analyze">Upload Resume</Link>
            </Button>
          </div>
          <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {trust.map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-success" /> {t}
              </li>
            ))}
          </ul>

          <ProductShot />
        </div>
      </section>

      {/* Social proof */}
      <div className="container py-12 text-center">
        <p className="text-xs uppercase tracking-wider text-muted-foreground/70">
          Helping job seekers get past the bots at
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-lg font-bold tracking-tight text-muted-foreground/40">
          {["TCS", "Infosys", "Flipkart", "Zoho", "Wipro", "Razorpay"].map((c) => (
            <span key={c}>{c}</span>
          ))}
        </div>
      </div>

      <FeatureGrid />

      {/* High-contrast free-first band (Vercel style) */}
      <section className="border-y border-border bg-black">
        <div className="container grid items-center gap-10 py-16 md:grid-cols-2">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight">
              Free-first.
              <br />
              <span className="gradient-text">Always.</span>
            </h2>
            <p className="mt-4 max-w-sm text-muted-foreground">
              No paywalls, no upgrade pop-ups, no credit card. Just the tools you
              need to land more interviews.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            {[
              ["₹0", "Cost to analyze"],
              ["<5s", "Time to results"],
              ["PDF", "+ HTML reports"],
              ["100%", "No login needed"],
            ].map(([big, small]) => (
              <div key={small} className="rounded-2xl border border-border bg-[#0a0b0e] p-5">
                <div className="text-3xl font-extrabold tracking-tight">{big}</div>
                <div className="mt-1 text-sm text-muted-foreground">{small}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HowItWorks />
      <FaqSection faqs={homeFaqs} id="home-faq" />

      {/* Final CTA */}
      <section className="container pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-card p-12 text-center md:p-16">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(closest-side,rgba(124,127,245,.25),transparent)]" />
          <h2 className="relative text-3xl font-extrabold tracking-tight md:text-4xl">
            Ready to fix your resume?
          </h2>
          <p className="relative mx-auto mt-3 max-w-md text-muted-foreground">
            Get your free ATS score in seconds. No account, no payment, no catch.
          </p>
          <Button asChild size="lg" className="relative mt-7">
            <Link href="/analyze">Analyze Resume Free →</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
