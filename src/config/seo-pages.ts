/**
 * Data that drives the programmatic SEO landing pages.
 * Each entry renders the analyzer call-to-action above the fold plus
 * unique content + FAQ below it, so pages are not duplicate content.
 */
export interface SeoPage {
  slug: string;
  navLabel: string;
  h1: string;
  title: string;
  description: string;
  keywords: string[];
  intro: string;
  benefits: { title: string; body: string }[];
  faqs: { question: string; answer: string }[];
}

export const seoPages: SeoPage[] = [
  {
    slug: "ats-resume-checker",
    navLabel: "ATS Checker",
    h1: "Free ATS Resume Checker",
    title: "Free ATS Resume Checker — Instant ATS Score",
    description:
      "Check if your resume passes ATS software. Upload your resume and get an instant ATS score, missing keywords and fixes. 100% free, no login needed.",
    keywords: [
      "ATS resume checker",
      "ATS checker",
      "applicant tracking system checker",
      "ATS friendly resume",
    ],
    intro:
      "Most companies in India use an Applicant Tracking System (ATS) to filter resumes before a recruiter ever sees them. Our free ATS resume checker scans your resume the way these systems do and shows you exactly what to fix to get past the filters.",
    benefits: [
      {
        title: "Instant ATS score",
        body: "Get a 0–100 ATS compatibility score in seconds, with a clear breakdown of what is helping and hurting you.",
      },
      {
        title: "Missing keyword detection",
        body: "Paste a job description and we highlight the exact keywords your resume is missing for that role.",
      },
      {
        title: "Actionable fixes",
        body: "Every issue comes with a concrete, plain-English suggestion you can apply right away.",
      },
    ],
    faqs: [
      {
        question: "What is an ATS and why does it matter?",
        answer:
          "An Applicant Tracking System is software recruiters use to scan, rank and filter resumes. If your resume is not ATS-friendly, it can be rejected before a human reads it.",
      },
      {
        question: "Is the ATS checker really free?",
        answer:
          "Yes. You can check your resume, see your score, view missing keywords and download a report without creating an account or paying anything.",
      },
      {
        question: "Do I need to sign up?",
        answer:
          "No. The full analysis works without login. You can optionally create a free account later to save your reports.",
      },
    ],
  },
  {
    slug: "resume-analyzer",
    navLabel: "Resume Analyzer",
    h1: "Free AI Resume Analyzer",
    title: "Free Resume Analyzer — AI Resume Analysis",
    description:
      "Analyze your resume with AI. Get strengths, weaknesses, missing keywords and improvement suggestions instantly. Free resume analyzer for India, no signup.",
    keywords: [
      "resume analyzer",
      "AI resume analyzer",
      "resume analysis tool",
      "analyze my resume",
    ],
    intro:
      "Our AI resume analyzer reviews your resume like an experienced recruiter. It identifies your strengths, flags weaknesses, and gives you specific, prioritized suggestions to make your resume stronger.",
    benefits: [
      {
        title: "Recruiter-style review",
        body: "Understand how a hiring manager perceives your resume and what to improve first.",
      },
      {
        title: "Strengths & weaknesses",
        body: "A clear list of what is working and what is dragging your resume down.",
      },
      {
        title: "Optimized preview",
        body: "See AI-rewritten bullet points with stronger action verbs and measurable impact.",
      },
    ],
    faqs: [
      {
        question: "How does the resume analyzer work?",
        answer:
          "Upload a PDF or DOCX resume and optionally paste a job description. We extract the text, score it, and use AI to generate a detailed analysis with suggestions.",
      },
      {
        question: "Which file formats are supported?",
        answer: "You can upload PDF and DOCX resumes up to 5 MB.",
      },
      {
        question: "Is my resume stored?",
        answer:
          "For anonymous users we process your resume in memory and store only the analysis output, never the raw resume text.",
      },
    ],
  },
  {
    slug: "resume-score-checker",
    navLabel: "Score Checker",
    h1: "Free Resume Score Checker",
    title: "Free Resume Score Checker — Rate My Resume",
    description:
      "Get an instant resume score out of 100. See your ATS score, resume strength and job-match percentage for free. No login, no payment.",
    keywords: [
      "resume score checker",
      "resume score",
      "rate my resume",
      "resume grader",
    ],
    intro:
      "Wondering how good your resume really is? Our resume score checker grades your resume on ATS compatibility, overall strength and job-match, so you know precisely where you stand.",
    benefits: [
      {
        title: "Three clear scores",
        body: "ATS score, resume strength score and job-match score — all in one view.",
      },
      {
        title: "Benchmarked feedback",
        body: "Understand what a strong score looks like and how to reach it.",
      },
      {
        title: "Free downloadable report",
        body: "Download your scores and suggestions as a PDF or HTML report.",
      },
    ],
    faqs: [
      {
        question: "What is a good resume score?",
        answer:
          "A score above 80 generally indicates a strong, ATS-friendly resume. Below 60 usually means there are important issues to fix.",
      },
      {
        question: "How is the score calculated?",
        answer:
          "We evaluate formatting, structure, keyword coverage, action verbs, quantification and, when provided, alignment with the job description.",
      },
      {
        question: "Can I improve my score?",
        answer:
          "Yes. Apply the suggestions, re-upload your resume, and you should see your score improve.",
      },
    ],
  },
  {
    slug: "free-resume-review",
    navLabel: "Free Review",
    h1: "Free Resume Review",
    title: "Free Resume Review — Instant AI Feedback",
    description:
      "Get a free resume review in seconds. Honest AI feedback on your resume's strengths, weaknesses and missing keywords. No account required.",
    keywords: [
      "free resume review",
      "resume review",
      "resume feedback",
      "resume critique",
    ],
    intro:
      "Get an honest, instant review of your resume — completely free. No waiting for an expert, no fees, and no account. Just upload your resume and get clear feedback you can act on today.",
    benefits: [
      {
        title: "Instant feedback",
        body: "No waiting days for a human reviewer — results in seconds.",
      },
      {
        title: "Honest and specific",
        body: "Direct feedback on what to keep, cut and rewrite.",
      },
      {
        title: "Great for freshers",
        body: "Especially helpful for students and freshers writing their first resume.",
      },
    ],
    faqs: [
      {
        question: "Is the resume review really free?",
        answer:
          "Yes, 100% free. There is no paywall on the analysis, suggestions or the downloadable report.",
      },
      {
        question: "Is this good for freshers?",
        answer:
          "Absolutely. The tool is ideal for freshers and students who want quick, structured feedback on their first resume.",
      },
      {
        question: "How long does it take?",
        answer: "The review usually completes within a few seconds.",
      },
    ],
  },
  {
    slug: "resume-keyword-checker",
    navLabel: "Keyword Checker",
    h1: "Free Resume Keyword Checker",
    title: "Free Resume Keyword Checker — Match Job Keywords",
    description:
      "Find the keywords your resume is missing for any job. Paste a job description and instantly see which ATS keywords to add. Free, no signup.",
    keywords: [
      "resume keyword checker",
      "resume keywords",
      "job description keywords",
      "keyword match resume",
    ],
    intro:
      "Recruiters and ATS software match your resume against the keywords in the job description. Our keyword checker compares your resume to any job posting and shows the exact keywords you are missing.",
    benefits: [
      {
        title: "Job-description matching",
        body: "Paste a job description and see your keyword match percentage instantly.",
      },
      {
        title: "Missing keyword list",
        body: "A precise list of the skills and terms to add to your resume.",
      },
      {
        title: "Beat the filters",
        body: "Improve your keyword coverage to rank higher in ATS results.",
      },
    ],
    faqs: [
      {
        question: "How do I check resume keywords?",
        answer:
          "Upload your resume, paste the target job description, and click Analyze. We highlight the keywords you are missing.",
      },
      {
        question: "Should I add every missing keyword?",
        answer:
          "Add only keywords that genuinely reflect your skills and experience. Never add false information to your resume.",
      },
      {
        question: "What is a good keyword match?",
        answer:
          "A match of 70% or higher is generally strong for a targeted application.",
      },
    ],
  },
];

export function getSeoPage(slug: string): SeoPage | undefined {
  return seoPages.find((p) => p.slug === slug);
}
