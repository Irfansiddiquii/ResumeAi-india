import { nanoid } from "nanoid";
import type { AnalysisResult } from "@/types/analysis";
import { computeScores } from "./scoring";
import { ruleBasedAnalysis } from "./rule-based";
import { geminiAnalysis, isGeminiConfigured } from "./gemini";

interface AnalyzeInput {
  resumeText: string;
  resumeFilename: string;
  jobDescription?: string;
}

type Signals = ReturnType<typeof computeScores>["signals"];

/** Short, factual signals that ground Gemini so its feedback matches the scores. */
function buildFacts(s: Signals): string[] {
  const facts: string[] = [];
  facts.push(s.years >= 1 ? `~${s.years} years of experience detected` : "little/no explicit tenure detected");
  facts.push(`${s.quantifiedAchievements} quantified achievement bullet(s)`);
  facts.push(`${s.actionVerbStarts} bullet(s) start with a strong action verb`);
  facts.push(`${s.skillsCount} distinct skills detected`);
  facts.push(s.hasProjects ? "has a projects section" : "no projects section");
  facts.push(s.hasDegree ? "degree present" : s.hasEducation ? "education present (no clear degree)" : "no education section");
  facts.push(s.hasCertifications ? "certifications present" : "no certifications");
  const contact = [s.hasEmail && "email", s.hasPhone && "phone", s.hasLinkedIn && "LinkedIn"].filter(Boolean);
  facts.push(`contact: ${contact.join(", ") || "none detected"}`);
  return facts;
}

/**
 * Orchestrates the full analysis:
 *  1. Deterministic scoring + keyword matching (always runs — explainable,
 *     consistent, India-aware). These remain authoritative.
 *  2. Qualitative narrative (strengths/weaknesses/recommendations/summary) via
 *     Gemini, grounded in the computed scores. Falls back to the rule-based
 *     narrative automatically if Gemini is unconfigured, times out or errors.
 */
export async function analyzeResume({
  resumeText,
  resumeFilename,
  jobDescription,
}: AnalyzeInput): Promise<AnalysisResult> {
  const { scores, breakdown, signals } = computeScores(resumeText, jobDescription);

  // Deterministic analysis: authoritative keywords + guaranteed-available narrative.
  const ruleBased = ruleBasedAnalysis(resumeText, jobDescription);

  let engine: AnalysisResult["engine"] = "rule-based";
  let strengths = ruleBased.strengths;
  let weaknesses = ruleBased.weaknesses;
  let recommendations = ruleBased.recommendations;
  let optimizedResume = ruleBased.optimizedResume;

  if (isGeminiConfigured()) {
    try {
      const ai = await geminiAnalysis({
        resumeText,
        jobDescription,
        scores,
        facts: buildFacts(signals),
      });
      // Adopt the AI narrative only if it returned the essentials.
      if (ai.strengths.length && ai.recommendations.length && ai.optimizedResume.summary && ai.optimizedResume.bullets.length) {
        engine = "gemini";
        strengths = ai.strengths;
        weaknesses = ai.weaknesses.length ? ai.weaknesses : ruleBased.weaknesses;
        recommendations = ai.recommendations;
        optimizedResume = ai.optimizedResume;
      }
    } catch (err) {
      // Any failure (no key, timeout, quota, bad output) → deterministic fallback.
      console.error("Gemini analysis failed, using rule-based fallback:", err);
    }
  }

  return {
    id: nanoid(12),
    createdAt: new Date().toISOString(),
    resumeFilename,
    hasJobDescription: Boolean(jobDescription),
    scores,
    breakdown,
    // Keywords stay deterministic + normalized so they're consistent with the
    // computed job-match score.
    missingKeywords: ruleBased.missingKeywords,
    matchedKeywords: ruleBased.matchedKeywords,
    strengths,
    weaknesses,
    recommendations,
    optimizedResume,
    engine,
  };
}
