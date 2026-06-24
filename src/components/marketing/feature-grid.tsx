import {
  Gauge,
  KeyRound,
  Target,
  Lightbulb,
  Wand2,
  Download,
} from "lucide-react";

const features = [
  {
    icon: Gauge,
    title: "ATS Score & Grade",
    body: "A clear 0–100 score and A+ to D letter grade showing how well your resume passes Applicant Tracking Systems.",
  },
  {
    icon: KeyRound,
    title: "Missing Keywords",
    body: "See exactly which keywords from the job description your resume is missing.",
  },
  {
    icon: Target,
    title: "Job Match %",
    body: "Understand how closely your resume matches a specific role before you apply.",
  },
  {
    icon: Lightbulb,
    title: "Smart Suggestions",
    body: "Specific, prioritized fixes — written in plain English you can act on today.",
  },
  {
    icon: Wand2,
    title: "Optimized Preview",
    body: "AI-rewritten bullet points with strong action verbs and measurable impact.",
  },
  {
    icon: Download,
    title: "Free Report",
    body: "Download your full analysis as a polished PDF or HTML report — no account needed.",
  },
];

export function FeatureGrid() {
  return (
    <section className="container py-20 md:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center rounded-full border border-border bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
          Features
        </span>
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">
          Everything you need to beat the bots
        </h2>
        <p className="mt-3 text-muted-foreground">
          A complete, free ATS toolkit — built for the Indian job market.
        </p>
      </div>
      <div className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="group rounded-2xl border border-border bg-gradient-to-b from-card to-card/40 p-6 transition-all hover:-translate-y-1 hover:border-white/20"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/12 text-primary">
              <f.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
