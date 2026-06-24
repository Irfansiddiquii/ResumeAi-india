export const siteConfig = {
  name: "ResumeAI India",
  shortName: "ResumeAI",
  description:
    "Free ATS resume checker for India. Upload your resume, get an instant ATS score, missing keywords, job-match percentage and AI-powered improvement suggestions. No login required.",
  // Canonical site URL. In production set NEXT_PUBLIC_SITE_URL; otherwise we
  // fall back to the deployed Vercel domain (never localhost) so generated
  // reports, sitemaps and share links always reference the live site.
  url:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://resume-ai-india.vercel.app",
  locale: "en_IN",
  keywords: [
    "ATS resume checker",
    "free resume review",
    "resume analyzer India",
    "resume score checker",
    "ATS checker for freshers",
    "resume keyword checker",
    "resume optimization tool",
  ],
  links: {
    github: "",
    twitter: "",
  },
  contactEmail: "hello@resumeai.in",
} as const;

export type SiteConfig = typeof siteConfig;
