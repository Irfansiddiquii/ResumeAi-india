import type { Scores } from "@/types/analysis";
import { matchKeywords } from "./keywords";

const ACTION_VERBS = [
  "led", "built", "created", "designed", "developed", "implemented", "launched",
  "managed", "improved", "increased", "reduced", "delivered", "drove",
  "optimized", "automated", "achieved", "spearheaded", "established",
  "engineered", "architected", "migrated", "scaled", "mentored", "owned",
  "shipped", "streamlined", "negotiated", "analyzed", "researched", "founded",
];

const SECTION_HINTS = [
  /experience/i,
  /education/i,
  /skills?/i,
  /projects?/i,
  /summary|objective|profile/i,
];

const CONTACT_HINTS = [
  /[\w.+-]+@[\w-]+\.[\w.-]+/, // email
  /(\+?\d[\d\s-]{8,})/, // phone
];

interface ScoreBreakdown {
  scores: Scores;
  signals: {
    wordCount: number;
    sectionsFound: number;
    actionVerbCount: number;
    quantifiedBullets: number;
    hasContact: boolean;
    bulletCount: number;
  };
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/**
 * Deterministic scoring used both as the baseline ATS/strength score and as a
 * fallback when the AI engine is unavailable. Intentionally explainable.
 */
export function computeScores(
  resumeText: string,
  jobDescription?: string
): ScoreBreakdown {
  const words = resumeText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const lower = resumeText.toLowerCase();

  const sectionsFound = SECTION_HINTS.filter((re) => re.test(resumeText)).length;
  const hasContact = CONTACT_HINTS.some((re) => re.test(resumeText));

  const bulletCount = (resumeText.match(/(^|\n)\s*[•\-*▪◦]/g) || []).length;
  const actionVerbCount = ACTION_VERBS.filter((v) =>
    new RegExp(`\\b${v}\\b`, "i").test(lower)
  ).length;

  // Bullets / lines that contain a number or percentage (quantified impact).
  // Counts percentages, currency (₹/$), and numeric magnitudes, but excludes
  // bare 4-digit values (usually calendar years, not achievements).
  const quantifiedBullets = (
    resumeText.match(/(\d+\s?%|[₹$]\s?\d|\b\d{2,3}\b|\b\d{5,}\b)/g) || []
  ).length;

  // ── ATS score: parse-ability, structure, contact, length ──
  let ats = 0;
  ats += Math.min(sectionsFound, 5) * 11; // up to 55
  ats += hasContact ? 12 : 0;
  ats += wordCount >= 250 && wordCount <= 1000 ? 18 : wordCount < 250 ? 6 : 10;
  ats += bulletCount >= 5 ? 15 : bulletCount * 2;

  // ── Strength score: action verbs, quantification, clarity ──
  let strength = 0;
  strength += Math.min(actionVerbCount, 10) * 5; // up to 50
  strength += Math.min(quantifiedBullets, 8) * 4; // up to 32
  strength += wordCount >= 300 && wordCount <= 900 ? 18 : 8;

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
      bulletCount,
    },
  };
}
