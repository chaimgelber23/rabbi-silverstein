import { fetchFromRss } from "./rss";
import type { Shiur } from "./types";

function normalizeTitle(title: string): string {
  return title.toLowerCase().replace(/\s+/g, " ").trim();
}

export async function fetchAllShiurim(): Promise<Shiur[]> {
  const rssShiurim = await fetchFromRss();

  const byTitle = new Map<string, Shiur>();
  for (const shiur of rssShiurim) {
    const key = normalizeTitle(shiur.title);
    if (key) byTitle.set(key, shiur);
  }

  const merged = Array.from(byTitle.values());
  merged.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  return merged;
}
