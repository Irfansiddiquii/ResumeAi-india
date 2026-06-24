import { GoogleGenerativeAI } from "@google/generative-ai";
import type { OptimizedResume, Suggestion } from "@/types/analysis";

export interface GeminiAnalysis {
  strengths: string[];
  weaknesses: string[];
  recommendations: Suggestion[];
  optimizedResume: OptimizedResume;
  missingKeywords: string[];
  matchedKeywords: string[];
}

const MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

function buildPrompt(resumeText: string, jobDescription?: string): string {
  const jdBlock = jobDescription
    ? `\n\nTARGET JOB DESCRIPTION:\n"""\n${jobDescription.slice(0, 8000)}\n"""`
    : "\n\nNo job description was provided. Evaluate the resume in general terms.";

  return `You are an expert technical recruiter and ATS specialist for the Indian job market.
Analyze the following resume${jobDescription ? " against the target job description" : ""}.

Return ONLY a valid JSON object (no markdown, no code fences) with EXACTLY this shape:
{
  "strengths": string[],            // 3-5 specific strengths
  "weaknesses": string[],           // 3-5 specific weaknesses
  "recommendations": [              // 4-6 concrete fixes
    { "title": string, "before"?: string, "after"?: string }
  ],
  "optimizedResume": {
    "summary": string,              // 2-3 sentence ATS-friendly professional summary
    "bullets": string[]             // 4-6 rewritten, quantified, action-verb bullet points
  },
  "missingKeywords": string[],      // keywords in the JD but missing from the resume (empty if no JD)
  "matchedKeywords": string[]       // important keywords present in the resume
}

Rules:
- Be specific and actionable. Never invent facts or fabricate experience.
- Keep each string concise.
- "missingKeywords" must be empty if no job description is provided.

RESUME:
"""
${resumeText.slice(0, 12000)}
"""${jdBlock}`;
}

function coerceStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string").map((s) => s.trim()).filter(Boolean);
}

function parseGeminiJson(raw: string): GeminiAnalysis {
  // Strip code fences / leading text and isolate the JSON object.
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object in Gemini response");
  const json = JSON.parse(raw.slice(start, end + 1));

  const recommendations: Suggestion[] = Array.isArray(json.recommendations)
    ? json.recommendations
        .filter((r: unknown) => r && typeof r === "object")
        .map((r: Record<string, unknown>) => ({
          title: String(r.title ?? "").trim(),
          before: typeof r.before === "string" ? r.before : undefined,
          after: typeof r.after === "string" ? r.after : undefined,
        }))
        .filter((r: Suggestion) => r.title.length > 0)
    : [];

  return {
    strengths: coerceStringArray(json.strengths),
    weaknesses: coerceStringArray(json.weaknesses),
    recommendations,
    optimizedResume: {
      summary: String(json.optimizedResume?.summary ?? "").trim(),
      bullets: coerceStringArray(json.optimizedResume?.bullets),
    },
    missingKeywords: coerceStringArray(json.missingKeywords),
    matchedKeywords: coerceStringArray(json.matchedKeywords),
  };
}

/**
 * Run the AI analysis with Gemini 2.0 Flash. Throws on any failure so the
 * caller can fall back to the deterministic engine.
 */
export async function geminiAnalysis(
  resumeText: string,
  jobDescription?: string
): Promise<GeminiAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: MODEL,
    generationConfig: {
      temperature: 0.4,
      responseMimeType: "application/json",
    },
  });

  const result = await model.generateContent(buildPrompt(resumeText, jobDescription));
  const text = result.response.text();
  return parseGeminiJson(text);
}
