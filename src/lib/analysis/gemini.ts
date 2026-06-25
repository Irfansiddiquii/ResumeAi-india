import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { OptimizedResume, Suggestion } from "@/types/analysis";

/** Narrative-only output from Gemini. Scores + keywords stay deterministic. */
export interface GeminiNarrative {
  strengths: string[];
  weaknesses: string[];
  recommendations: Suggestion[];
  optimizedResume: OptimizedResume;
}

export interface GeminiContext {
  resumeText: string;
  jobDescription?: string;
  scores: { ats: number; strength: number; match: number | null };
  /** Short detected facts that ground the model so output matches the scores. */
  facts: string[];
}

// Primary model + automatic fallback model (tried in order before giving up).
const PRIMARY_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const FALLBACK_MODEL = "gemini-1.5-flash";
const TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS || 22000);

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

// Structured-output schema — forces well-formed, parseable JSON from the model.
const responseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    strengths: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    weaknesses: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    recommendations: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          before: { type: SchemaType.STRING },
          after: { type: SchemaType.STRING },
        },
        required: ["title"],
      },
    },
    summary: { type: SchemaType.STRING },
    bullets: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
  },
  required: ["strengths", "weaknesses", "recommendations", "summary", "bullets"],
} as const;

function buildPrompt(ctx: GeminiContext): string {
  const { resumeText, jobDescription, scores, facts } = ctx;
  const jdBlock = jobDescription
    ? `\n\nTARGET JOB DESCRIPTION:\n"""\n${jobDescription.slice(0, 8000)}\n"""`
    : "\n\nNo job description was provided — evaluate the resume in general terms and do not invent a target role.";

  const scoreLine = `ATS ${scores.ats}/100, Resume Strength ${scores.strength}/100${
    scores.match === null ? ", Job Match not calculated (no JD)" : `, Job Match ${scores.match}%`
  }`;

  return `You are an expert technical recruiter and ATS specialist for the Indian job market.
Analyze the resume below${jobDescription ? " against the target job description" : ""} and produce a high-quality, personalized review.

OUR ENGINE ALREADY COMPUTED THESE SCORES (treat as ground truth — your feedback MUST be consistent with them):
- Scores: ${scoreLine}
- Detected facts: ${facts.join("; ") || "none"}

Write feedback that explains and aligns with these scores. For example, if Resume Strength is low, your weaknesses and recommendations should focus on what's dragging it down (missing metrics, weak verbs, thin experience).

STRICT RULES:
- Be SPECIFIC to THIS resume. Every strength/weakness/recommendation must reference concrete content (a real bullet, section, skill, number, or its absence).
- NEVER output generic filler like "tailor your resume to the job" without saying exactly what to change.
- Never fabricate experience, employers, degrees or metrics the candidate does not have.
- For recommendations, prefer a concrete before/after rewrite drawn from the candidate's actual bullets where possible.
- The optimized summary must reflect the candidate's real role, seniority and top skills.
- Keep each item concise (one sentence).

Produce:
- strengths: 3-5 specific strengths
- weaknesses: 3-5 specific weaknesses
- recommendations: 4-6 concrete fixes, each { title, and optional before/after }
- summary: a 2-3 sentence ATS-friendly professional summary tailored to this candidate
- bullets: 4-6 rewritten, quantified, action-verb bullet points based on their real experience

RESUME:
"""
${resumeText.slice(0, 12000)}
"""${jdBlock}`;
}

function coerceStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is string => typeof x === "string")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseNarrative(raw: string): GeminiNarrative {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object in Gemini response");
  const json = JSON.parse(raw.slice(start, end + 1));

  const recommendations: Suggestion[] = Array.isArray(json.recommendations)
    ? json.recommendations
        .filter((r: unknown) => r && typeof r === "object")
        .map((r: Record<string, unknown>) => ({
          title: String(r.title ?? "").trim(),
          before: typeof r.before === "string" && r.before.trim() ? r.before.trim() : undefined,
          after: typeof r.after === "string" && r.after.trim() ? r.after.trim() : undefined,
        }))
        .filter((r: Suggestion) => r.title.length > 0)
    : [];

  return {
    strengths: coerceStringArray(json.strengths),
    weaknesses: coerceStringArray(json.weaknesses),
    recommendations,
    optimizedResume: {
      summary: String(json.summary ?? json.optimizedResume?.summary ?? "").trim(),
      bullets: coerceStringArray(json.bullets ?? json.optimizedResume?.bullets),
    },
  };
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Gemini timed out after ${ms}ms`)), ms)
    ),
  ]);
}

async function runModel(
  genAI: GoogleGenerativeAI,
  modelName: string,
  prompt: string
): Promise<GeminiNarrative> {
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.4,
      responseMimeType: "application/json",
      responseSchema: responseSchema as never,
    },
  });
  const result = await withTimeout(model.generateContent(prompt), TIMEOUT_MS);
  return parseNarrative(result.response.text());
}

/**
 * Run AI analysis with Gemini (primary model, then a fallback model). Throws on
 * total failure so the caller can fall back to the deterministic engine.
 */
export async function geminiAnalysis(ctx: GeminiContext): Promise<GeminiNarrative> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

  const genAI = new GoogleGenerativeAI(apiKey);
  const prompt = buildPrompt(ctx);
  const models = PRIMARY_MODEL === FALLBACK_MODEL ? [PRIMARY_MODEL] : [PRIMARY_MODEL, FALLBACK_MODEL];

  let lastErr: unknown;
  for (const m of models) {
    try {
      return await runModel(genAI, m, prompt);
    } catch (err) {
      lastErr = err;
      console.error(`Gemini model "${m}" failed:`, err instanceof Error ? err.message : err);
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Gemini analysis failed");
}
