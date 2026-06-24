import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description:
    "ResumeAI India is a free, ATS-friendly resume analyzer built to help job seekers in India get past resume filters and land more interviews.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="container py-16 md:py-20">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          About {siteConfig.name}
        </h1>
        <div className="mt-6 space-y-4 text-muted-foreground">
          <p>
            {siteConfig.name} is a free-first platform that helps job seekers in
            India understand and improve their resumes. We believe everyone
            deserves a fair shot at getting past Applicant Tracking Systems —
            without paying or signing up.
          </p>
          <p>
            Upload your resume, optionally paste a job description, and get an
            instant ATS score, missing keywords, a job-match percentage and
            clear, AI-powered suggestions. Your full report is free to download.
          </p>
          <p>
            We are privacy-first: for anonymous users we do not store your raw
            resume text. We only keep the analysis output so you can view and
            download your report.
          </p>
        </div>
      </div>
    </div>
  );
}
