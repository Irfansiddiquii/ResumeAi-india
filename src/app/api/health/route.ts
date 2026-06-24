import { NextResponse } from "next/server";
import { isGeminiConfigured } from "@/lib/analysis/gemini";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    status: "healthy",
    time: new Date().toISOString(),
    services: {
      gemini: isGeminiConfigured() ? "configured" : "fallback (rule-based)",
      rateLimit: process.env.UPSTASH_REDIS_REST_URL ? "configured" : "disabled",
    },
  });
}
