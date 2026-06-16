import type { MetadataRoute } from "next";
import { getAllSlugs, canonicalSeriesSlug } from "@/lib/seriesConfig";
import { fetchAllShiurim } from "@/lib/shiurim";

const SITE_URL = "https://rabbiodomsilverstein.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
  const seriesPages: MetadataRoute.Sitemap = getAllSlugs().map((slug) => ({
    url: `${SITE_URL}/shiurim/${slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  // Per-shiur pages — one URL per episode for the long-tail. Guarded so a feed
  // outage degrades to the static + series sitemap rather than failing the build.
  let shiurPages: MetadataRoute.Sitemap = [];
  try {
    const all = await fetchAllShiurim();
    shiurPages = all.map((s) => ({
      url: `${SITE_URL}/shiurim/${canonicalSeriesSlug(s)}/${encodeURIComponent(s.id)}`,
      lastModified: new Date(s.pubDate),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch {
    // keep the static + series sitemap if the feed is unavailable
  }

  return [...staticPages, ...seriesPages, ...shiurPages];
}
