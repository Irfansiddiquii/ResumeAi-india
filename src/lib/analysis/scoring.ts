import type { Scores } from "@/types/analysis";
import { matchKeywords, countSkills } from "./keywords";

// Expanded action-verb list (area 12).
const ACTION_VERBS = new Set([
  "led", "built", "created", "designed", "developed", "implemented", "launched",
  "managed", "improved", "increased", "reduced", "delivered", "drove", "drive",
  "optimized", "automated", "achieved", "spearheaded", "established",
  "engineered", "architected", "migrated", "scaled", "mentored", "owned",
  "shipped", "streamlined", "negotiated", "analyzed", "researched", "founded",
  "boosted", "cut", "generated", "coordinated", "executed", "produced",
  "directed", "oversaw", "transformed", "accelerated", "redesigned",
  "refactored", "deployed", "integrated", "championed", "initiated",
  "orchestrated", "pioneered", "revamped", "saved", "secured", "grew",
  "expanded", "trained", "supervised", "resolved", "eliminated", "enhanced",
  "facilitated", "forecasted", "headed", "modernized", "programmed",
]);

const SECTION_HINTS = [
  /experience|employment|work history/i,
  /education|academics?/i,
  /skills?|technologies|technical|competenc/i,
  /projects?|portfolio/i,
  /summary|objective|profile|about/i,
];

interface Signals {
  wordCount: number;
  sectionsFound: number;
  bulletCount: number;
  actionVerbCount: number;
  actionVerbStarts: number;
  quantifiedAchievements: number;
  hasEmail: boolean;
  hasPhone: boolean;
  hasLinkedIn: boolean;
  hasContact: boolean;
  hasDates: boolean;
  hasSkillsSection: boolean;
  hasEducation: boolean;
  hasDegree: boolean;
  hasCertifications: boolean;
  hasProjects: boolean;
  projectCount: number;
  skillsCount: number;
  years: number;
}

interface ScoreBreakdown {
  scores: Scores;
  breakdown: { label: string; score: number }[];
  signals: Signals;
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}
function ratio(n: number, cap: number): number {
  return Math.min(n, cap) / cap;
}

/** Graded length score: full marks in the recruiter-friendly sweet spot. */
function lengthFit(wordCount: number, max: number): number {
  if (wordCount >= 400 && wordCount <= 850) return max;
  if (wordCount < 400) return max * Math.max(0.2, wordCount / 400);
  return max * Math.max(0.35, 1 - (wordCount - 850) / 1200);
}

export function computeScores(
  resumeText: string,
  jobDescription?: string
): ScoreBreakdown {
  const words = resumeText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const lower = resumeText.toLowerCase();

  const bulletLines = resumeText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => /^[•\-*▪◦]/.test(l))
    .map((l) => l.replace(/^[•\-*▪◦]+\s*/, "").trim());

  const sectionsFound = SECTION_HINTS.filter((re) => re.test(resumeText)).length;
  const bulletCount = (resumeText.match(/(^|\n)\s*[•\-*▪◦]/g) || []).length;

  // Contact validation (area 11)
  const hasEmail = /\b[\w.+-]+@[\w-]+\.[a-z]{2,}\b/i.test(resumeText);
  const hasPhone = /(?:\+?\d[\d\s-]{8,12}\d)/.test(resumeText);
  const hasLinkedIn = /linkedin\.com\/in\//i.test(lower) || /\blinkedin\b/i.test(lower);
  const hasContact = hasEmail || hasPhone;

  // Action verbs anywhere + at the start of bullets (area 12)
  let actionVerbStarts = 0;
  for (const b of bulletLines) {
    const first = b.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "");
    if (first && ACTION_VERBS.has(first)) actionVerbStarts++;
  }
  let actionVerbCount = 0;
  for (const v of ACTION_VERBS) {
    if (new RegExp(`\\b${v}\\b`, "i").test(lower)) actionVerbCount++;
  }

  // Quantified achievements (areas 8, 13): bullets carrying real metrics.
  const QUANT = /(\d+\s?%|[₹$]\s?\d|\b\d{2,3}\b|\b\d{5,}\b)/;
  const quantifiedAchievements = bulletLines.filter((b) => QUANT.test(b)).length;

  // Work timeline
  const yearMatches = (resumeText.match(/\b(?:19|20)\d{2}\b/g) || []).map(Number);
  const hasDates = yearMatches.length >= 2;
  let years = 0;
  if (yearMatches.length >= 2) {
    years = Math.min(15, Math.max(...yearMatches) - Math.min(...yearMatches));
  }
  const yrsPhrase = resumeText.match(/(\d{1,2})\s*\+?\s*(?:years|yrs)\b/i);
  if (yrsPhrase) years = Math.max(years, Math.min(15, parseInt(yrsPhrase[1], 10)));

  // Section / credential detection (areas 6, 7, 9, 10)
  const hasSkillsSection = /\b(skills|technologies|technical skills|core competenc)/i.test(resumeText);
  const hasEducation = /\b(education|bachelor|master|b\.?\s?tech|b\.?\s?e\b|m\.?\s?tech|mba|b\.?\s?sc|m\.?\s?sc|bca|mca|ph\.?d|university|college|institute of technology|degree)\b/i.test(resumeText);
  const hasDegree = /\b(bachelor|master|b\.?\s?tech|b\.?\s?e\b|m\.?\s?tech|mba|b\.?\s?sc|m\.?\s?sc|bca|mca|ph\.?d)\b/i.test(resumeText);
  const hasCertifications = /\b(certified|certification|certificate|credential|aws certified|pmp|scrum master|coursera|udemy|nptel|google cloud certified)\b/i.test(resumeText);
  const projectCount = (lower.match(/\bprojects?\b/g) || []).length;
  const hasProjects = /\bprojects?\b/i.test(resumeText);

  const skillsCount = countSkills(resumeText);

  // ── ATS compatibility (area 15) ──
  const ats =
    ratio(sectionsFound, 5) * 22 +
    (hasEmail ? 8 : 0) + (hasPhone ? 6 : 0) + (hasLinkedIn ? 4 : 0) + // contact 18
    (hasDates ? 10 : 0) +
    ratio(bulletCount, 8) * 16 +
    lengthFit(wordCount, 18) +
    (hasSkillsSection ? 8 : 0) +
    ratio(actionVerbCount, 8) * 8;

  // ── Resume strength ──
  const expDepth = ratio(years, 6) * 0.6 + ratio(bulletCount, 8) * 0.4;
  const strength =
    ratio(quantifiedAchievements, 5) * 28 + // quantified achievements
    ratio(actionVerbStarts, 5) * 22 + // strong action-verb bullets
    expDepth * 16 + // experience depth
    ratio(skillsCount, 10) * 12 + // skill breadth
    (hasDegree ? 10 : hasEducation ? 6 : 0) + // education
    (hasProjects ? 7 : 0) + // projects
    (hasCertifications ? 5 : 0); // certifications

  // ── Job match ──
  let match: number | null = null;
  if (jobDescription && jobDescription.trim().length > 0) {
    match = matchKeywords(resumeText, jobDescription).matchPercent;
  }

  // ── Detailed breakdown (area 5) ──
  const breakdown: { label: string; score: number }[] = [
    { label: "Structure", score: clamp((ratio(sectionsFound, 5) * 0.6 + ratio(bulletCount, 8) * 0.4) * 100) },
    { label: "Contact", score: clamp((hasEmail ? 50 : 0) + (hasPhone ? 30 : 0) + (hasLinkedIn ? 20 : 0)) },
    { label: "Experience", score: clamp(expDepth * 100) },
    { label: "Impact", score: clamp((ratio(quantifiedAchievements, 5) * 0.5 + ratio(actionVerbStarts, 5) * 0.5) * 100) },
    { label: "Skills", score: clamp(ratio(skillsCount, 10) * 100) },
    { label: "Education", score: clamp((hasDegree ? 80 : hasEducation ? 50 : 0) + (hasCertifications ? 20 : 0)) },
    { label: "Length", score: clamp(lengthFit(wordCount, 100)) },
  ];
  if (match !== null) breakdown.splice(2, 0, { label: "Keywords", score: clamp(match) });

  return {
    scores: {
      ats: clamp(ats),
      strength: clamp(strength),
      match: match === null ? null : clamp(match),
    },
    breakdown,
    signals: {
      wordCount, sectionsFound, bulletCount, actionVerbCount, actionVerbStarts,
      quantifiedAchievements, hasEmail, hasPhone, hasLinkedIn, hasContact,
      hasDates, hasSkillsSection, hasEducation, hasDegree, hasCertifications,
      hasProjects, projectCount, skillsCount, years,
    },
  };
}
