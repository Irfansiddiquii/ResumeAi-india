import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description:
    "How ResumeAI India handles your resume and data. Privacy-first: we do not store raw resume text for anonymous users.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <div className="container py-16 md:py-20">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Privacy Policy
        </h1>
        <div className="mt-6 space-y-5 text-sm leading-relaxed text-muted-foreground">
          <p>
            This is a simplified summary for the MVP. {siteConfig.name} is built
            to be privacy-first.
          </p>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Your resume
            </h2>
            <p className="mt-1">
              When you analyze a resume anonymously, the file is processed in
              memory to extract text and generate your analysis. We do not store
              your raw resume text. Only the analysis output is kept in your
              browser for the session so you can view and download your report.
            </p>
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Usage data
            </h2>
            <p className="mt-1">
              To prevent abuse and understand aggregate usage, we may log
              anonymous events. We never store your raw IP address — only a
              salted, irreversible hash.
            </p>
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Third-party AI
            </h2>
            <p className="mt-1">
              Resume text may be sent to our AI provider (Google Gemini) solely
              to generate your analysis.
            </p>
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Contact</h2>
            <p className="mt-1">
              Questions? Reach us at {siteConfig.contactEmail}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
