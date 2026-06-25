export type GradeTone = "success" | "cyan" | "warning" | "destructive";

export interface Grade {
  letter: string;
  label: string;
  tone: GradeTone;
}

/** Map a 0–100 score to a resume grade. */
export function getGrade(score: number): Grade {
  if (score >= 90) return { letter: "A+", label: "Excellent resume", tone: "success" };
  if (score >= 80) return { letter: "A", label: "Strong resume", tone: "success" };
  if (score >= 70) return { letter: "B", label: "Good — almost there", tone: "cyan" };
  if (score >= 55) return { letter: "C", label: "Needs some work", tone: "warning" };
  return { letter: "D", label: "Major issues to fix", tone: "destructive" };
}

export const GRADE_SCALE: { letter: string; range: string; min: number }[] = [
  { letter: "D", range: "0–54", min: 0 },
  { letter: "C", range: "55–69", min: 55 },
  { letter: "B", range: "70–79", min: 70 },
  { letter: "A", range: "80–89", min: 80 },
  { letter: "A+", range: "90–100", min: 90 },
];

/** Which scale segment is active for a given score. */
export function activeGradeIndex(score: number): number {
  if (score >= 90) return 4;
  if (score >= 80) return 3;
  if (score >= 70) return 2;
  if (score >= 55) return 1;
  return 0;
}

export interface ScoreInput {
  ats: number;
  strength: number;
  match: number | null;
}

/**
 * Overall score driving the grade — a WEIGHTED BLEND of all metrics, not just
 * ATS. Resume Strength carries the most weight because content quality is what
 * actually wins interviews. Job Match is included only when a job description
 * was provided.
 *
 *   With JD:    ATS 30% · Strength 45% · Match 25%
 *   Without JD: ATS 45% · Strength 55%
 */
export function computeOverall({ ats, strength, match }: ScoreInput): number {
  if (match !== null) {
    return Math.round(ats * 0.3 + strength * 0.45 + match * 0.25);
  }
  return Math.round(ats * 0.45 + strength * 0.55);
}

/** Human-readable weight description for the tooltip / explainer. */
export function overallFormula(hasJobDescription: boolean): string {
  return hasJobDescription
    ? "Resume Strength 45% · ATS Compatibility 30% · Job Match 25%"
    : "Resume Strength 55% · ATS Compatibility 45%";
}

export interface ConfidenceReason {
  label: string;
  ok: boolean;
}

export interface Confidence {
  level: "High" | "Medium" | "Low";
  percent: number;
  tone: GradeTone;
  reasons: ConfidenceReason[];
}

/** How much the user should trust this report, with the contributing reasons. */
export function computeConfidence(opts: {
  engine: "gemini" | "rule-based";
  hasJobDescription: boolean;
  keywordSignal: number;
}): Confidence {
  const reasons: ConfidenceReason[] = [];
  let p = 50;

  if (opts.engine === "gemini") {
    p += 28;
    reasons.push({ label: "AI-powered analysis (Gemini 2.0 Flash)", ok: true });
  } else {
    reasons.push({ label: "Fast heuristic analysis (AI not configured)", ok: false });
  }

  if (opts.hasJobDescription) {
    p += 15;
    reasons.push({ label: "Job description provided — job match calculated", ok: true });
  } else {
    reasons.push({ label: "No job description — job match not calculated", ok: false });
  }

  if (opts.keywordSignal >= 6) {
    p += 7;
    reasons.push({ label: "Strong keyword signal detected in resume", ok: true });
  } else {
    reasons.push({ label: "Limited keyword signal detected", ok: false });
  }

  const percent = Math.max(40, Math.min(96, p));
  const level = percent >= 82 ? "High" : percent >= 64 ? "Medium" : "Low";
  const tone: GradeTone =
    level === "High" ? "success" : level === "Medium" ? "cyan" : "warning";

  return { level, percent, tone, reasons };
}

/** Plain-language explanations used in tooltips and the "how it's calculated" card. */
export const METRIC_INFO = {
  overall:
    "Your Overall Grade is a weighted blend of Resume Strength (highest weight), ATS Compatibility and, when a job description is provided, Job Match. Strength matters most because content quality is what wins interviews — so a high ATS score alone won't earn a top grade.",
  ats:
    "How cleanly an Applicant Tracking System can parse and rank your resume — based on standard sections, contact details, work-history dates, bullet structure and length.",
  strength:
    "How compelling your content is — strong action verbs, quantified achievements, conciseness and a scannable structure.",
  match:
    "How closely your resume matches the keywords in the job description you pasted. A job description is required to calculate this.",
  confidence:
    "How much to trust this report. It's higher when AI analysis is used, a job description is provided, and we detect enough resume content.",
} as const;

export const BREAKDOWN_INFO: Record<string, string> = {
  Structure:
    "Presence of standard sections (Experience, Education, Skills…) and use of bullet points.",
  Contact: "Whether a detectable email and phone number are present.",
  Keywords:
    "Share of the job description's important keywords that appear in your resume.",
  Impact:
    "Use of quantified achievements (numbers, %, ₹) and strong action verbs.",
  Length: "Whether your resume length sits in the recruiter-friendly range.",
};
