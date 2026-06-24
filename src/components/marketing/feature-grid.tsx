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
    title: "ATS Score",
    body: "A clear 0–100 score showing how well your resume passes Applicant Tracking Systems.",
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
    body: "Download your full analysis as a PDF or HTML report — no account needed.",
  },
];

export function FeatureGrid() {
  return (
    <section className="container py-16 md:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
          Everything you need to beat the bots
        </h2>
        <p className="mt-3 text-muted-foreground">
          A complete, free ATS toolkit — built for job seekers in India.
        </p>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="rounded-xl border bg-card p-6 shadow-sm">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
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
