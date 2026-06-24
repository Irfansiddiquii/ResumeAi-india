import { NextRequest, NextResponse } from "next/server";
import { analysisResultSchema } from "@/lib/validation";
import { createSharedResult } from "@/lib/analysis/share";
import { isKvConfigured } from "@/lib/kv";
import { logUsage } from "@/lib/usage";
import { siteConfig } from "@/config/site";
import { FEATURES } from "@/lib/features";
import type { AnalysisResult, ApiError } from "@/types/analysis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json<ApiError>(
    { ok: false, error: { code, message } },
    { status }
  );
}

export async function POST(req: NextRequest) {
  if (!FEATURES.SHAREABLE_RESULTS) {
    return errorResponse("DISABLED", "Sharing is currently disabled.", 403);
  }
  if (!isKvConfigured()) {
    return errorResponse(
      "SHARING_UNAVAILABLE",
      "Sharing isn't enabled on this deployment yet.",
      503
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse("BAD_REQUEST", "Invalid JSON body.", 400);
  }

  const parsed = analysisResultSchema.safeParse(
    (body as { result?: unknown })?.result
  );
  if (!parsed.success) {
    return errorResponse("INVALID_RESULT", "Invalid analysis payload.", 400);
  }

  try {
    const token = await createSharedResult(parsed.data as AnalysisResult);
    if (!token) {
      return errorResponse(
        "SHARING_UNAVAILABLE",
        "Sharing isn't enabled on this deployment yet.",
        503
      );
    }
    await logUsage("share");
    const url = `${siteConfig.url}/result/${token}`;
    return NextResponse.json({ ok: true, token, url });
  } catch (err) {
    console.error("Share creation failed:", err);
    return errorResponse("SHARE_FAILED", "Could not create a share link.", 500);
  }
}
