import { fetchFromRss } from "./rss";
import { fetchCustomShiurim } from "./customData";
import type { Shiur } from "./types";

function normalizeTitle(title: string): string {
  return title.toLowerCase().replace(/\s+/g, " ").trim();
}

export async function fetchAllShiurim(): Promise<Shiur[]> {
  const [rssShiurim, customShiurim] = await Promise.all([
    fetchFromRss(),
    fetchCustomShiurim(),
  ]);

  const byKey = new Map<string, Shiur>();

  // RSS shiurim keyed by normalized title (existing dedup logic)
  for (const shiur of rssShiurim) {
    const key = normalizeTitle(shiur.title);
    if (key) byKey.set(key, shiur);
  }

  // Custom shiurim keyed by id to never collide with RSS
  for (const shiur of customShiurim) {
    byKey.set(`custom:${shiur.id}`, shiur);
  }

  const merged = Array.from(byKey.values());
  merged.sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );

  return merged;
}
