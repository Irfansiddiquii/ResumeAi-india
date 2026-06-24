import { getRedis } from "@/lib/kv";

export type UsageEvent = "upload" | "analyze" | "share" | "download";

/**
 * Lightweight, privacy-preserving usage analytics. Increments per-event
 * counters (lifetime total + per-day) in Redis. No PII is stored — only
 * aggregate counts. Never throws and never blocks the request.
 */
export async function logUsage(event: UsageEvent): Promise<void> {
  try {
    const redis = await getRedis();
    if (!redis) return;
    const day = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    await Promise.all([
      redis.incr(`usage:${event}:total`),
      redis.incr(`usage:${event}:${day}`),
    ]);
  } catch {
    // Analytics must never affect the user-facing request.
  }
}

/** Read aggregate counters (used by an internal stats endpoint if needed). */
export async function getUsageTotals(): Promise<Record<UsageEvent, number>> {
  const events: UsageEvent[] = ["upload", "analyze", "share", "download"];
  const empty = { upload: 0, analyze: 0, share: 0, download: 0 };
  try {
    const redis = await getRedis();
    if (!redis) return empty;
    const values = await Promise.all(
      events.map((e) => redis.get<number>(`usage:${e}:total`))
    );
    events.forEach((e, i) => (empty[e] = values[i] ?? 0));
    return empty;
  } catch {
    return empty;
  }
}
