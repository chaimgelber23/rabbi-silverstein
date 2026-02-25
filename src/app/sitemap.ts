import type { MetadataRoute } from "next";
import { getAllSlugs, SERIES, SERIES_GROUPS } from "@/lib/seriesConfig";

const SITE_URL = "https://rabbi-silverstein.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
  ];

  // All series and group pages
  const slugs = getAllSlugs();
  const seriesPages: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${SITE_URL}/shiurim/${slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...seriesPages];
}
