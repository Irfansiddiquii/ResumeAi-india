import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { buildHtmlReport } from "@/lib/report/html-report";
import { buildPdfReport } from "@/lib/report/pdf-report";
import type { AnalysisResult } from "@/types/analysis";
import type { ApiError } from "@/types/analysis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Validate the result payload sent from the client (Phase 1 has no server-side
// persistence, so the browser posts the analysis back to generate the report).
const suggestionSchema = z.object({
  title: z.string(),
  before: z.string().optional(),
  after: z.string().optional(),
});

const resultSchema = z.object({
  id: z.string(),
  shareToken: z.string().optional(),
  createdAt: z.string(),
  resumeFilename: z.string().max(300),
  hasJobDescription: z.boolean(),
  scores: z.object({
    ats: z.number(),
    strength: z.number(),
    match: z.number().nullable(),
  }),
  missingKeywords: z.array(z.string()).max(100),
  matchedKeywords: z.array(z.string()).max(100),
  strengths: z.array(z.string()).max(50),
  weaknesses: z.array(z.string()).max(50),
  recommendations: z.array(suggestionSchema).max(50),
  optimizedResume: z.object({
    summary: z.string(),
    bullets: z.array(z.string()).max(50),
  }),
  engine: z.enum(["gemini", "rule-based"]),
});

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json<ApiError>(
    { ok: false, error: { code, message } },
    { status }
  );
}

export async function POST(req: NextRequest) {
  const format = (req.nextUrl.searchParams.get("format") || "pdf").toLowerCase();
  if (format !== "pdf" && format !== "html") {
    return errorResponse("BAD_FORMAT", "Format must be 'pdf' or 'html'.", 400);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse("BAD_REQUEST", "Invalid JSON body.", 400);
  }

  const parsed = resultSchema.safeParse(
    (body as { result?: unknown })?.result
  );
  if (!parsed.success) {
    return errorResponse("INVALID_RESULT", "Invalid analysis payload.", 400);
  }
  const result = parsed.data as AnalysisResult;

  const safeName =
    result.resumeFilename.replace(/\.[^.]+$/, "").replace(/[^a-z0-9-_]+/gi, "_") ||
    "resume";

  try {
    if (format === "html") {
      const html = buildHtmlReport(result);
      return new NextResponse(html, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Disposition": `attachment; filename="${safeName}-ResumeAI-report.html"`,
        },
      });
    }

    const pdf = await buildPdfReport(result);
    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeName}-ResumeAI-report.pdf"`,
      },
    });
  } catch (err) {
    console.error("Report generation failed:", err);
    return errorResponse(
      "REPORT_FAILED",
      "Could not generate the report. Please try again.",
      500
    );
  }
}
