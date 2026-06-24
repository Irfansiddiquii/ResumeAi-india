/** Shared types for the resume analysis flow. */

export interface Scores {
  /** ATS compatibility, 0–100. */
  ats: number;
  /** Overall resume strength, 0–100. */
  strength: number;
  /** Job-match percentage, 0–100. Null when no job description was provided. */
  match: number | null;
}

export interface Suggestion {
  title: string;
  /** Optional before/after rewrite of a bullet point. */
  before?: string;
  after?: string;
}

export interface OptimizedResume {
  summary: string;
  bullets: string[];
}

export interface AnalysisResult {
  id: string;
  /** Present only when the analysis is persisted (logged-in users / shares). */
  shareToken?: string;
  createdAt: string;
  resumeFilename: string;
  hasJobDescription: boolean;
  scores: Scores;
  missingKeywords: string[];
  matchedKeywords: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: Suggestion[];
  optimizedResume: OptimizedResume;
  /** Which engine produced the qualitative analysis. */
  engine: "gemini" | "rule-based";
}

export interface AnalyzeApiResponse {
  ok: true;
  result: AnalysisResult;
}

export interface ApiError {
  ok: false;
  error: { code: string; message: string };
}
