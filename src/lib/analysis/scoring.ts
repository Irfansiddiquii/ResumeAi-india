import type { Scores } from "@/types/analysis";
import { matchKeywords } from "./keywords";

const ACTION_VERBS = [
  "led", "built", "created", "designed", "developed", "implemented", "launched",
  "managed", "improved", "increased", "reduced", "delivered", "drove",
  "optimized", "automated", "achieved", "spearheaded", "established",
  "engineered", "architected", "migrated", "scaled", "mentored", "owned",
  "shipped", "streamlined", "negotiated", "analyzed", "researched", "founded",
  "boosted", "cut", "generated", "led", "coordinated", "executed", "produced",
];

const SECTION_HINTS = [
  /experience|employment|work history/i,
  /education|academics?/i,
  /skills?|technologies|technical/i,
  /projects?|portfolio/i,
  /summary|objective|profile|about/i,
];

interface ScoreBreakdown {
  scores: Scores;
  signals: {
    wordCount: number;
    sectionsFound: number;
    actionVerbCount: number;
    quantifiedBullets: number;
    hasContact: boolean;
    hasEmail: boolean;
    hasPhone: boolean;
    hasDates: boolean;
    bulletCount: number;
  };
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/**
 * Graded score for resume length: full marks inside the recruiter-friendly
 * sweet spot, tapering smoothly for resumes that are too short or too long.
 */
function lengthFit(wordCount: number, max: number): number {
  if (wordCount >= 400 && wordCount <= 850) return max;
  if (wordCount < 400) return max * Math.max(0.2, wordCount / 400);
  return max * Math.max(0.35, 1 - (wordCount - 850) / 1200);
}

/**
 * Deterministic scoring used both as the baseline ATS/strength score and as a
 * fallback when the AI engine is unavailable. Intentionally explainable, and
 * built from several granular signals so scores spread realistically instead
 * of clustering around a few fixed values.
 */
export function computeScores(
  resumeText: string,
  jobDescription?: string
): ScoreBreakdown {
  const words = resumeText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const lower = resumeText.toLowerCase();

  const sectionsFound = SECTION_HINTS.filter((re) => re.test(resumeText)).length;

  const hasEmail = /[\w.+-]+@[\w-]+\.[\w.-]+/.test(resumeText);
  const hasPhone = /(?:\+?\d[\d\s-]{8,}\d)/.test(resumeText);
  const hasContact = hasEmail || hasPhone;

  const bulletCount = (resumeText.match(/(^|\n)\s*[•\-*▪◦]/g) || []).length;

  const actionVerbCount = ACTION_VERBS.filter((v) =>
    new RegExp(`\\b${v}\\b`, "i").test(lower)
  ).length;

  // Quantified impact: percentages, currency (₹/$), and numeric magnitudes,
  // excluding bare 4-digit values (usually calendar years, not achievements).
  const quantifiedBullets = (
    resumeText.match(/(\d+\s?%|[₹$]\s?\d|\b\d{2,3}\b|\b\d{5,}\b)/g) || []
  ).length;

  // Work-history dates (e.g. "2019", "2020-2023") signal a parseable timeline.
  const yearMatches = resumeText.match(/\b(?:19|20)\d{2}\b/g) || [];
  const hasDates = yearMatches.length >= 2;

  // ── ATS score (0–100): how cleanly an ATS parses it + the essentials ──
  const ats =
    (Math.min(sectionsFound, 5) / 5) * 28 + // standard sections
    (hasEmail ? 9 : 0) +
    (hasPhone ? 6 : 0) + // contact completeness (15)
    (Math.min(bulletCount, 8) / 8) * 17 + // structured bullet points
    lengthFit(wordCount, 22) + // appropriate length
    (hasDates ? 8 : 0) + // parseable work timeline
    (Math.min(actionVerbCount, 8) / 8) * 10; // meaningful content

  // ── Strength score (0–100): how compelling the content reads ──
  const strength =
    (Math.min(actionVerbCount, 12) / 12) * 35 + // strong action verbs
    (Math.min(quantifiedBullets, 10) / 10) * 35 + // quantified achievements
    lengthFit(wordCount, 15) + // conciseness
    (Math.min(bulletCount, 8) / 8) * 15; // scannable structure

  // ── Job-match score ──
  let match: number | null = null;
  if (jobDescription && jobDescription.trim().length > 0) {
    match = matchKeywords(resumeText, jobDescription).matchPercent;
  }

  return {
    scores: {
      ats: clamp(ats),
      strength: clamp(strength),
      match: match === null ? null : clamp(match),
    },
    signals: {
      wordCount,
      sectionsFound,
      actionVerbCount,
      quantifiedBullets,
      hasContact,
      hasEmail,
      hasPhone,
      hasDates,
      bulletCount,
    },
  };
}
