import { NextRequest, NextResponse } from "next/server";
import { analyzeResume } from "@/lib/analysis/analyzer";
import { extractResumeText, ResumeParseError } from "@/lib/parsing/extract";
import {
  jobDescriptionSchema,
  validateResumeFile,
  MAX_FILE_BYTES,
} from "@/lib/validation";
import {
  checkRateLimit,
  getClientIp,
  hashIp,
  type RateLimitResult,
} from "@/lib/ratelimit";
import type { ApiError, AnalyzeApiResponse } from "@/types/analysis";
import { logUsage } from "@/lib/usage";

// pdf-parse + mammoth require the Node.js runtime (not Edge).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json<ApiError>(
    { ok: false, error: { code, message } },
    { status }
  );
}

export async function POST(req: NextRequest) {
  // ── Rate limit (no-op if Upstash is not configured) ──
  const ip = getClientIp(req.headers);
  const ipHash = hashIp(ip);
  let rl: RateLimitResult = { success: true, remaining: 999, limit: 999, reset: 0 };
  try {
    rl = await checkRateLimit(ipHash);
    if (!rl.success) {
      const retryAfter = rl.reset
        ? Math.max(1, Math.ceil((rl.reset - Date.now()) / 1000))
        : 3600;
      return NextResponse.json<ApiError>(
        {
          ok: false,
          error: {
            code: "RATE_LIMITED",
            message:
              "You've reached the free analysis limit. Please try again later.",
          },
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
            "X-RateLimit-Limit": String(rl.limit),
            "X-RateLimit-Remaining": String(rl.remaining),
          },
        }
      );
    }
  } catch (err) {
    // A rate-limiter outage must never block the core (free) flow.
    console.error("Rate limit check failed (continuing):", err);
  }

  // ── Parse multipart form ──
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return errorResponse("BAD_REQUEST", "Invalid form submission.", 400);
  }

  const file = formData.get("resume");
  const jdRaw = formData.get("jobDescription");

  if (!(file instanceof File)) {
    return errorResponse("NO_FILE", "Please upload a resume file.", 400);
  }
  if (file.size > MAX_FILE_BYTES) {
    return errorResponse("FILE_TOO_LARGE", "File is larger than the 5 MB limit.", 413);
  }

  const validation = validateResumeFile({
    name: file.name,
    type: file.type,
    size: file.size,
  });
  if (!validation.ok || !validation.kind) {
    return errorResponse("INVALID_FILE", validation.error ?? "Invalid file.", 400);
  }

  // ── Validate optional job description ──
  const jdParse = jobDescriptionSchema.safeParse(
    typeof jdRaw === "string" ? jdRaw : undefined
  );
  if (!jdParse.success) {
    return errorResponse(
      "INVALID_JD",
      jdParse.error.issues[0]?.message ?? "Invalid job description.",
      400
    );
  }
  const jobDescription = jdParse.data;

  // ── Extract text ──
  let resumeText: string;
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    resumeText = await extractResumeText(buffer, validation.kind);
  } catch (err) {
    if (err instanceof ResumeParseError) {
      return errorResponse("PARSE_ERROR", err.message, 422);
    }
    console.error("Unexpected parse error:", err);
    return errorResponse("PARSE_ERROR", "We couldn't read this resume.", 422);
  }

  // ── Analyze ──
  try {
    const result = await analyzeResume({
      resumeText,
      resumeFilename: file.name,
      jobDescription,
    });
    await logUsage("analyze");
    return NextResponse.json<AnalyzeApiResponse>(
      { ok: true, result },
      {
        headers: {
          "Cache-Control": "no-store",
          "X-RateLimit-Limit": String(rl.limit),
          "X-RateLimit-Remaining": String(rl.remaining),
        },
      }
    );
  } catch (err) {
    console.error("Analysis failed:", err);
    return errorResponse(
      "ANALYSIS_FAILED",
      "Something went wrong while analyzing your resume. Please try again.",
      500
    );
  }
}
