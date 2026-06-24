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

/**
 * Orchestrates the full analysis:
 *  1. Deterministic scoring (always runs — explainable, fast).
 *  2. Qualitative analysis via Gemini 2.0 Flash, falling back to the
 *     rule-based engine if Gemini is unconfigured or errors out.
 */
export async function analyzeResume({
  resumeText,
  resumeFilename,
  jobDescription,
}: AnalyzeInput): Promise<AnalysisResult> {
  const { scores, breakdown } = computeScores(resumeText, jobDescription);

  let engine: AnalysisResult["engine"] = "rule-based";
  let qualitative = ruleBasedAnalysis(resumeText, jobDescription);

  if (isGeminiConfigured()) {
    try {
      const ai = await geminiAnalysis(resumeText, jobDescription);
      // Only adopt the AI output if it returned the essentials.
      if (ai.strengths.length && ai.recommendations.length && ai.optimizedResume.summary) {
        engine = "gemini";
        qualitative = {
          ...ai,
          // Keep deterministic keyword matching authoritative when a JD exists
          // and the model returned nothing useful.
          missingKeywords:
            jobDescription && ai.missingKeywords.length === 0
              ? qualitative.missingKeywords
              : ai.missingKeywords,
          matchedKeywords: ai.matchedKeywords.length
            ? ai.matchedKeywords
            : qualitative.matchedKeywords,
        };
      }
    } catch (err) {
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
    missingKeywords: qualitative.missingKeywords,
    matchedKeywords: qualitative.matchedKeywords,
    strengths: qualitative.strengths,
    weaknesses: qualitative.weaknesses,
    recommendations: qualitative.recommendations,
    optimizedResume: qualitative.optimizedResume,
    engine,
  };
}
