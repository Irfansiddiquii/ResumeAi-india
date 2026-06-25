import type { OptimizedResume, Suggestion } from "@/types/analysis";
import { computeScores } from "./scoring";
import { extractKeywords, matchKeywords, sortByCategory } from "./keywords";

export interface QualitativeAnalysis {
  strengths: string[];
  weaknesses: string[];
  recommendations: Suggestion[];
  optimizedResume: OptimizedResume;
  missingKeywords: string[];
  matchedKeywords: string[];
}

const ROLE_TITLES = [
  "full stack developer", "full-stack developer", "software engineer",
  "backend engineer", "backend developer", "frontend engineer",
  "frontend developer", "data scientist", "data analyst", "business analyst",
  "product manager", "project manager", "ui/ux designer", "ux designer",
  "ui designer", "graphic designer", "marketing manager", "digital marketer",
  "sales executive", "financial analyst", "hr manager", "human resources",
  "marketing manager", "devops engineer", "qa engineer",
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
  for (const role of ROLE_TITLES) if (lowerText.includes(role)) return titleCase(role);
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

export function ruleBasedAnalysis(
  resumeText: string,
  jobDescription?: string
): QualitativeAnalysis {
  const { signals } = computeScores(resumeText, jobDescription);
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: Suggestion[] = [];

  // ── Strengths (specific to detected signals) ──
  if (signals.hasEmail && signals.hasPhone && signals.hasLinkedIn)
    strengths.push("Complete, recruiter-friendly contact details (email, phone and LinkedIn).");
  else if (signals.hasContact)
    strengths.push("Contact details are present and easy for recruiters to find.");
  if (signals.sectionsFound >= 4)
    strengths.push("Well-structured with clearly labelled, ATS-friendly sections.");
  if (signals.actionVerbStarts >= 4)
    strengths.push("Most bullet points open with strong action verbs.");
  if (signals.quantifiedAchievements >= 3)
    strengths.push("Several achievements are quantified with concrete metrics.");
  if (signals.hasProjects)
    strengths.push("Includes a projects section that demonstrates applied skills.");
  if (signals.hasDegree)
    strengths.push("Education and qualifications are clearly listed.");
  if (signals.hasCertifications)
    strengths.push("Relevant certifications add credibility.");
  if (signals.skillsCount >= 8)
    strengths.push("Broad, relevant skill set detected for your field.");
  if (strengths.length === 0)
    strengths.push("You have a foundation to build on — let's strengthen it.");

  // ── Weaknesses + recommendations (priority-ordered, specific) ──
  if (!signals.hasContact) {
    weaknesses.push("No clearly detectable email or phone number.");
    recommendations.push({ title: "Add a clear contact line with your email and phone number at the top." });
  } else if (!signals.hasEmail || !signals.hasPhone) {
    weaknesses.push("Contact details look incomplete (missing email or phone).");
    recommendations.push({ title: "Include both a professional email and a phone number in the header." });
  } else if (!signals.hasLinkedIn) {
    recommendations.push({ title: "Add your LinkedIn profile URL — most recruiters expect it." });
  }

  if (signals.quantifiedAchievements < 3) {
    weaknesses.push("Few achievements are backed by measurable results.");
    recommendations.push({
      title: "Quantify your impact with numbers, percentages, ₹ or timeframes.",
      before: "Improved the team's workflow",
      after: "Streamlined the team's workflow, cutting delivery time by 30%",
    });
  }
  if (signals.actionVerbStarts < 4) {
    weaknesses.push("Many bullets don't start with a strong action verb.");
    recommendations.push({
      title: "Start each bullet with a strong action verb (Led, Built, Reduced…).",
      before: "Responsible for handling customer queries",
      after: "Resolved 50+ daily customer queries, improving CSAT by 18%",
    });
  }
  if (!signals.hasProjects) {
    weaknesses.push("No projects section detected.");
    recommendations.push({ title: "Add a Projects section with 2–3 relevant projects and the outcomes they produced." });
  }
  if (signals.sectionsFound < 4) {
    weaknesses.push("Some standard sections (Summary, Experience, Education, Skills) appear to be missing.");
    recommendations.push({ title: "Use standard section headings so ATS software can parse your resume correctly." });
  }
  if (!signals.hasEducation) {
    weaknesses.push("No education section detected.");
    recommendations.push({ title: "Add an Education section with your degree, institution and graduation year." });
  }
  if (signals.skillsCount < 5) {
    weaknesses.push("Limited skills/technologies detected.");
    recommendations.push({ title: "Expand your Skills section with the specific tools and technologies for your target role." });
  }
  if (!signals.hasCertifications && signals.skillsCount >= 3) {
    recommendations.push({ title: "Add relevant certifications (e.g., AWS, Google Cloud, PMP) to strengthen credibility." });
  }
  if (signals.wordCount < 250) {
    weaknesses.push("Resume is quite short and may lack detail.");
    recommendations.push({ title: "Expand on your responsibilities and achievements with specific, outcome-focused examples." });
  } else if (signals.wordCount > 1100) {
    weaknesses.push("Resume is long; recruiters may not read all of it.");
    recommendations.push({ title: "Trim to the most relevant 1–2 pages, keeping your strongest achievements." });
  }

  // ── Keywords (normalized + de-duplicated by matchKeywords/extractKeywords) ──
  let missingKeywords: string[] = [];
  let matchedKeywords: string[] = [];
  if (jobDescription && jobDescription.trim().length > 0) {
    const m = matchKeywords(resumeText, jobDescription);
    missingKeywords = sortByCategory(m.missing).slice(0, 15);
    matchedKeywords = sortByCategory(m.matched).slice(0, 15);
    if (missingKeywords.length > 0) {
      recommendations.push({
        title: `Weave in these job-description keywords where you genuinely have the experience: ${missingKeywords.slice(0, 6).join(", ")}.`,
      });
    }
  } else {
    matchedKeywords = sortByCategory(extractKeywords(resumeText, 12));
  }

  if (weaknesses.length === 0)
    weaknesses.push("No major issues detected — focus on tailoring to each job.");

  // ── Personalized optimized preview ──
  const lowerText = resumeText.toLowerCase();
  const topSkills = sortByCategory(extractKeywords(resumeText, 8));
  const role = detectRole(lowerText);
  const years = signals.years;
  const realQuantified = extractBulletLines(resumeText).find((l) => /\d/.test(l));

  const roleLabel = role ?? "Professional";
  const expPart = years >= 1 ? `${years}+ years of experience` : "hands-on experience";
  let summary = `${capitalize(roleLabel)} with ${expPart}`;
  if (topSkills.length) summary += ` across ${topSkills.slice(0, 4).join(", ")}`;
  if (signals.hasDegree) summary += ", backed by a relevant degree";
  summary += ". Focused on delivering measurable, results-driven impact";
  if (jobDescription && missingKeywords.length) {
    summary += ` and aligning closely with roles requiring ${missingKeywords.slice(0, 3).join(", ")}`;
  }
  summary += ".";

  const bullets: string[] = [];
  if (topSkills[0]) {
    bullets.push(`Lead with your ${topSkills[0]} work — open with a strong action verb and a metric, e.g. "Built a ${topSkills[0]} solution that improved efficiency by 30%."`);
  }
  bullets.push("Quantify outcomes wherever possible — add numbers, %, ₹ or time saved so achievements stand out to recruiters and ATS.");
  if (jobDescription && missingKeywords.length) {
    bullets.push(`Naturally incorporate ${missingKeywords.slice(0, 4).join(", ")} where you have genuine experience to raise your job-match score.`);
  }
  if (realQuantified) {
    bullets.push(`Keep and emphasise results like: "${truncate(realQuantified, 120)}".`);
  } else if (topSkills[1]) {
    bullets.push(`Showcase your ${topSkills[1]} experience with a concrete project example and the outcome it produced.`);
  }
  if (bullets.length < 3)
    bullets.push("Tailor the top third of your resume to each role — that's what recruiters read first.");

  return {
    strengths: strengths.slice(0, 6),
    weaknesses: weaknesses.slice(0, 6),
    recommendations: recommendations.slice(0, 6),
    optimizedResume: { summary, bullets },
    missingKeywords,
    matchedKeywords,
  };
}
