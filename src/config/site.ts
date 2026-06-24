export const siteConfig = {
  name: "ResumeAI India",
  shortName: "ResumeAI",
  description:
    "Free ATS resume checker for India. Upload your resume, get an instant ATS score, missing keywords, job-match percentage and AI-powered improvement suggestions. No login required.",
  // Read from env in production; falls back to localhost in dev.
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
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
