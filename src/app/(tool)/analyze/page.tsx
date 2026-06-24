import type { Metadata } from "next";
import { AnalyzeWidget } from "@/components/analyze/analyze-widget";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Analyze Your Resume Free",
  description:
    "Upload your resume and get an instant free ATS score, missing keywords, job-match percentage and AI suggestions. No login required.",
  path: "/analyze",
});

export default function AnalyzePage() {
  return (
    <div className="container py-12 md:py-16">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Analyze your resume
          </h1>
          <p className="mt-3 text-muted-foreground">
            Upload a PDF or DOCX resume and optionally paste a job description.
            Your free analysis is ready in seconds — no account needed.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border bg-card p-5 shadow-sm md:p-7">
          <AnalyzeWidget />
        </div>
      </div>
    </div>
  );
}
