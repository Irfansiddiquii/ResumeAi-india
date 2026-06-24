import { nanoid } from "nanoid";
import { getRedis } from "@/lib/kv";
import type { AnalysisResult } from "@/types/analysis";

/**
 * Shareable results are OPT-IN: a result is only persisted when the user
 * explicitly clicks "Share". Storage is Upstash Redis with a 30-day TTL.
 * Privacy is preserved — we store the analysis output only (same as the
 * client already holds), never the raw resume.
 */
const PREFIX = "share:";
const TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

export async function createSharedResult(
  result: AnalysisResult
): Promise<string | null> {
  const redis = await getRedis();
  if (!redis) return null;

  const token = nanoid(16);
  const payload: AnalysisResult = { ...result, shareToken: token };
  await redis.set(PREFIX + token, payload, { ex: TTL_SECONDS });
  return token;
}

export async function getSharedResult(
  token: string
): Promise<AnalysisResult | null> {
  const redis = await getRedis();
  if (!redis) return null;

  const value = await redis.get<AnalysisResult | string>(PREFIX + token);
  if (!value) return null;

  // Upstash usually auto-deserializes JSON; guard against a raw string too.
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as AnalysisResult;
    } catch {
      return null;
    }
  }
  return value as AnalysisResult;
}
