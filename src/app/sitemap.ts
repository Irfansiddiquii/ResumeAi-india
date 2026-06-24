import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { seoPages } from "@/config/seo-pages";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const now = new Date();

  const staticRoutes = ["", "/analyze", "/about", "/privacy"].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const seoRoutes = seoPages.map((p) => ({
    url: `${base}/${p.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...seoRoutes];
}
