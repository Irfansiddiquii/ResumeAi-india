import type { Redis as RedisClient } from "@upstash/redis";

/**
 * Shared Upstash Redis client (used for shareable results + usage analytics).
 * Returns null when Upstash isn't configured so every caller degrades to a
 * no-op — the core free flow never depends on it.
 */
let client: RedisClient | null = null;
let initialized = false;

export function isKvConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

export async function getRedis(): Promise<RedisClient | null> {
  if (initialized) return client;
  initialized = true;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const { Redis } = await import("@upstash/redis");
  client = new Redis({ url, token });
  return client;
}
