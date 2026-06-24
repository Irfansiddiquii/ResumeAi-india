import type { OptimizedResume, Suggestion } from "@/types/analysis";
import { computeScores } from "./scoring";
import { extractKeywords, matchKeywords } from "./keywords";

export interface QualitativeAnalysis {
  strengths: string[];
  weaknesses: string[];
  recommendations: Suggestion[];
  optimizedResume: OptimizedResume;
  missingKeywords: string[];
  matchedKeywords: string[];
}

// Ordered most-specific first so the longest matching title wins.
const ROLE_TITLES = [
  "full stack developer", "full-stack developer", "software engineer",
  "backend engineer", "backend developer", "frontend engineer",
  "frontend developer", "data scientist", "data analyst", "business analyst",
  "product manager", "project manager", "ui/ux designer", "ux designer",
  "ui designer", "graphic designer", "marketing manager", "digital marketer",
  "sales executive", "financial analyst", "devops engineer", "qa engineer",
  "test engineer", "mobile developer", "android developer", "ios developer",
  "web developer", "accountant", "consultant", "developer", "engineer",
  "designer", "analyst", "manager", "intern",
];

function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function truncate(s: string, max: number): string {
  const t = s.trim();
  return t.length > max ? t.slice(0, max - 1).trimEnd() + "…" : t;
}

function detectRole(lowerText: string): string | undefined {
  for (const role of ROLE_TITLES) {
    if (lowerText.includes(role)) return titleCase(role);
  }
  return undefined;
}

function detectYears(text: string): number | undefined {
  const m = text.match(/(\d{1,2})\s*\+?\s*(?:years|yrs)\b/i);
  if (m) {
    const n = parseInt(m[1], 10);
    if (n > 0 && n < 50) return n;
  }
  return undefined;
}

function extractBulletLines(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => /^[•\-*▪◦]/.test(l))
    .map((l) => l.replace(/^[•\-*▪◦]+\s*/, "").trim())
    .filter((l) => l.length >= 15);
}

/**
 * Deterministic, offline analysis. Always available — used directly when no
 * Gemini key is configured, and as a fallback if the AI call fails.
 */
export function ruleBasedAnalysis(
  resumeText: string,
  jobDescription?: string
): QualitativeAnalysis {
  const { signals } = computeScores(resumeText, jobDescription);
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: Suggestion[] = [];

  // Strengths
  if (signals.hasContact)
    strengths.push("Contact details are present and easy for recruiters to find.");
  if (signals.sectionsFound >= 4)
    strengths.push("Resume is well-structured with clearly labelled sections.");
  if (signals.actionVerbCount >= 5)
    strengths.push("Good use of strong action verbs to describe your impact.");
  if (signals.quantifiedBullets >= 3)
    strengths.push("Achievements are quantified with numbers and metrics.");
  if (signals.hasDates)
    strengths.push("Your work timeline includes clear dates, which ATS parse well.");
  if (strengths.length === 0)
    strengths.push("You have a foundation to build on — let's strengthen it.");

  // Weaknesses + recommendations
  if (!signals.hasContact) {
    weaknesses.push("No clearly detectable email or phone number.");
    recommendations.push({
      title: "Add a clear contact line with your email and phone number at the top.",
    });
  } else if (!signals.hasEmail || !signals.hasPhone) {
    weaknesses.push("Contact details look incomplete (missing email or phone).");
    recommendations.push({
      title: "Include both a professional email and a phone number in the header.",
    });
  }
  if (signals.sectionsFound < 4) {
    weaknesses.push("Some standard sections (Summary, Experience, Education, Skills) appear to be missing.");
    recommendations.push({
      title: "Use standard section headings so ATS software can parse your resume correctly.",
    });
  }
  if (signals.actionVerbCount < 5) {
    weaknesses.push("Bullet points rely on weak phrasing instead of strong action verbs.");
    recommendations.push({
      title: "Start each bullet with a strong action verb.",
      before: "Responsible for handling customer queries",
      after: "Resolved 50+ daily customer queries, improving CSAT by 18%",
    });
  }
  if (signals.quantifiedBullets < 3) {
    weaknesses.push("Few achievements are backed by measurable results.");
    recommendations.push({
      title: "Quantify your impact with numbers, percentages or timeframes.",
      before: "Improved the team's workflow",
      after: "Streamlined the team's workflow, cutting delivery time by 30%",
    });
  }
  if (signals.wordCount < 250) {
    weaknesses.push("Resume is quite short and may lack detail.");
    recommendations.push({
      title: "Expand on your responsibilities and achievements with specific examples.",
    });
  } else if (signals.wordCount > 1100) {
    weaknesses.push("Resume is long; recruiters may not read all of it.");
    recommendations.push({
      title: "Trim to the most relevant 1–2 pages, keeping your strongest achievements.",
    });
  }

  // Keywords
  let missingKeywords: string[] = [];
  let matchedKeywords: string[] = [];
  if (jobDescription && jobDescription.trim().length > 0) {
    const m = matchKeywords(resumeText, jobDescription);
    missingKeywords = m.missing.slice(0, 15);
    matchedKeywords = m.matched.slice(0, 15);
    if (missingKeywords.length > 0) {
      recommendations.push({
        title: `Add relevant keywords from the job description where they truly apply: ${missingKeywords
          .slice(0, 6)
          .join(", ")}.`,
      });
    }
  } else {
    // Without a JD we surface the resume's own dominant keywords for awareness.
    matchedKeywords = extractKeywords(resumeText, 12);
  }

  if (weaknesses.length === 0)
    weaknesses.push("No major issues detected — focus on tailoring to each job.");

  // ── Personalized optimized preview ──
  // Built from the candidate's own resume signal: detected role, years of
  // experience, their top skills, a real quantified line, and (when a JD is
  // present) the specific keywords they should weave in.
  const lowerText = resumeText.toLowerCase();
  const topSkills = extractKeywords(resumeText, 8);
  const role = detectRole(lowerText);
  const years = detectYears(resumeText);
  const bulletLines = extractBulletLines(resumeText);
  const realQuantified = bulletLines.find((l) => /\d/.test(l));

  const roleLabel = role ?? "Professional";
  const expPart = years
    ? `${years}+ years of experience`
    : "hands-on experience";
  let summary = `${capitalize(roleLabel)} with ${expPart}`;
  if (topSkills.length) summary += ` in ${topSkills.slice(0, 4).join(", ")}`;
  summary += ". Focused on delivering measurable, results-driven impact";
  if (jobDescription && missingKeywords.length) {
    summary += ` and aligning closely with roles requiring ${missingKeywords
      .slice(0, 3)
      .join(", ")}`;
  }
  summary += ".";

  const bullets: string[] = [];
  if (topSkills[0]) {
    bullets.push(
      `Lead with your ${topSkills[0]} work — open with a strong action verb and a metric, e.g. "Built a ${topSkills[0]} solution that improved efficiency by 30%."`
    );
  }
  bullets.push(
    "Quantify outcomes wherever possible — add numbers, %, ₹ or time saved so achievements stand out to both recruiters and ATS."
  );
  if (jobDescription && missingKeywords.length) {
    bullets.push(
      `Naturally incorporate ${missingKeywords
        .slice(0, 4)
        .join(", ")} where you have genuine experience to raise your job-match score.`
    );
  }
  if (realQuantified) {
    bullets.push(`Keep and emphasise results like: "${truncate(realQuantified, 120)}".`);
  } else if (topSkills[1]) {
    bullets.push(
      `Showcase your ${topSkills[1]} experience with a concrete project example and the outcome it produced.`
    );
  }
  if (bullets.length < 3) {
    bullets.push(
      "Tailor the top third of your resume to each role — that's what recruiters read first."
    );
  }

  const optimizedResume: OptimizedResume = { summary, bullets };

  return {
    strengths,
    weaknesses,
    recommendations,
    optimizedResume,
    missingKeywords,
    matchedKeywords,
  };
}
