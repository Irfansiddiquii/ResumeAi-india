import { NextRequest, NextResponse } from "next/server";
import { isGeminiConfigured, geminiProbe } from "@/lib/analysis/gemini";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const base = {
    ok: true,
    status: "healthy",
    time: new Date().toISOString(),
    services: {
      gemini: isGeminiConfigured() ? "configured" : "fallback (rule-based)",
      rateLimit: process.env.UPSTASH_REDIS_REST_URL ? "configured" : "disabled",
    },
  };

  // TEMPORARY diagnostic: /api/health?probe=gemini runs a live Gemini call and
  // returns which model/mode worked or the exact upstream error (no secrets).
  // Remove after the Gemini path is verified working.
  if (req.nextUrl.searchParams.get("probe") === "gemini") {
    const geminiProbeResult = await geminiProbe();
    return NextResponse.json({ ...base, geminiProbe: geminiProbeResult });
  }

  return NextResponse.json(base);
}
