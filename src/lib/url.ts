import { siteConfig } from "@/config/site";

/**
 * Resolve the public base URL for a request, guaranteeing reports/share links
 * never embed `localhost` in production.
 *
 * Priority:
 *  1. NEXT_PUBLIC_SITE_URL (explicit canonical domain), else
 *  2. the actual request host (the live Vercel domain when deployed), else
 *  3. the configured site URL.
 */
export function getBaseUrl(headers: Headers): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (envUrl) return envUrl;

  const host = headers.get("x-forwarded-host") || headers.get("host");
  if (host && !host.includes("localhost") && !host.startsWith("127.")) {
    const proto = headers.get("x-forwarded-proto") || "https";
    return `${proto}://${host}`;
  }

  return siteConfig.url;
}
