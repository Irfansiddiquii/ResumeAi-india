import { createHash } from "crypto";

/**
 * IP-based rate limiting via Upstash Redis. If Upstash env vars are not set
 * (e.g. local dev), this becomes a no-op so the core flow keeps working.
 *
 * We never store raw IPs — only a salted SHA-256 hash, used for both rate
 * limiting and anonymous usage analytics.
 */

let ratelimit: import("@upstash/ratelimit").Ratelimit | null = null;
let initialized = false;

async function getLimiter() {
  if (initialized) return ratelimit;
  initialized = true;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const [{ Ratelimit }, { Redis }] = await Promise.all([
    import("@upstash/ratelimit"),
    import("@upstash/redis"),
  ]);

  ratelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    // 10 analyses per hour per IP — generous for genuine users, blocks abuse.
    limiter: Ratelimit.slidingWindow(10, "1 h"),
    prefix: "resumeai:analyze",
    analytics: false,
  });

  return ratelimit;
}

export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT || "resumeai-dev-salt";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

/** Extract the client IP from request headers (Vercel / proxies). */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") || "0.0.0.0";
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  limit: number;
  reset: number;
}

export async function checkRateLimit(ipHash: string): Promise<RateLimitResult> {
  const limiter = await getLimiter();
  if (!limiter) {
    // No Upstash configured → allow (no-op).
    return { success: true, remaining: 999, limit: 999, reset: 0 };
  }
  const res = await limiter.limit(ipHash);
  return {
    success: res.success,
    remaining: res.remaining,
    limit: res.limit,
    reset: res.reset,
  };
}
