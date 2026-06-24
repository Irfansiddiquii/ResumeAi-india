import { UploadCloud, ScanLine, FileCheck2 } from "lucide-react";

const steps = [
  {
    icon: UploadCloud,
    n: "STEP 1",
    title: "Upload your resume",
    body: "Drop your PDF or DOCX resume. No account, no email, no payment.",
  },
  {
    icon: ScanLine,
    n: "STEP 2",
    title: "Analyze instantly",
    body: "Add a job description to unlock your job-match score and missing keywords.",
  },
  {
    icon: FileCheck2,
    n: "STEP 3",
    title: "Improve & download",
    body: "Get fixes and an optimized preview, then download your report as PDF or HTML.",
  },
];

export function HowItWorks() {
  return (
    <section className="container py-20 md:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center rounded-full border border-border bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
          How it works
        </span>
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">
          Three steps, zero friction
        </h2>
      </div>
      <div className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-3">
        {steps.map((step) => (
          <div key={step.title} className="rounded-2xl border border-border bg-card p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/12 text-primary">
              <step.icon className="h-5 w-5" />
            </span>
            <div className="mt-4 text-xs font-semibold tracking-wide text-primary">
              {step.n}
            </div>
            <h3 className="mt-1.5 font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
