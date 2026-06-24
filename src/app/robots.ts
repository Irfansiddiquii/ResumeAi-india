import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Result pages are per-session and client-rendered — no SEO value.
      disallow: ["/api/", "/result/"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
