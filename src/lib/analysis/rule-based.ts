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
  if (strengths.length === 0)
    strengths.push("You have a foundation to build on — let's strengthen it.");

  // Weaknesses + recommendations
  if (!signals.hasContact) {
    weaknesses.push("No clearly detectable email or phone number.");
    recommendations.push({
      title: "Add a clear contact line with your email and phone number at the top.",
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

  // A lightweight "optimized" preview built from the resume's own signal.
  const topKeywords = extractKeywords(resumeText, 6);
  const optimizedResume: OptimizedResume = {
    summary:
      "Results-driven professional with proven experience in " +
      (topKeywords.slice(0, 4).join(", ") || "your field") +
      ". Skilled at delivering measurable impact and collaborating across teams.",
    bullets: [
      "Led key initiatives that delivered measurable business results.",
      "Improved processes and efficiency through data-driven decisions.",
      "Collaborated cross-functionally to ship high-quality outcomes on time.",
    ],
  };

  return {
    strengths,
    weaknesses,
    recommendations,
    optimizedResume,
    missingKeywords,
    matchedKeywords,
  };
}
