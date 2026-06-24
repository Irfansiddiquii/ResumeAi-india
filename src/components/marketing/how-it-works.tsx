import { UploadCloud, ScanLine, FileCheck2 } from "lucide-react";

const steps = [
  {
    icon: UploadCloud,
    title: "1. Upload your resume",
    body: "Drop your PDF or DOCX resume. No account, no email, no payment — just upload.",
  },
  {
    icon: ScanLine,
    title: "2. Analyze instantly",
    body: "We score your resume for ATS compatibility and, if you add a job description, match it against the role.",
  },
  {
    icon: FileCheck2,
    title: "3. Improve & download",
    body: "Get missing keywords, fixes and an optimized preview — then download your report as PDF or HTML.",
  },
];

export function HowItWorks() {
  return (
    <section className="container py-16 md:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
          How it works
        </h2>
        <p className="mt-3 text-muted-foreground">
          Three simple steps. No friction, no sign-up.
        </p>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {steps.map((step) => (
          <div
            key={step.title}
            className="rounded-xl border bg-card p-6 shadow-sm"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <step.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
