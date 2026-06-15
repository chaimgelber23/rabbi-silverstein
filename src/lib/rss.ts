import { XMLParser } from "fast-xml-parser";
import { unstable_cache } from "next/cache";
import type { Shiur } from "./types";

/**
 * Feed sources, in priority order. The FIRST feed is the canonical/primary one —
 * its shiur ids are derived exactly as before (trailing digits of the guid), because
 * existing user progress (localStorage + Firestore) is keyed to those ids and must
 * keep mapping. Additional feeds get namespaced ids (idPrefix + full guid) so they
 * can NEVER collide with the primary feed's numeric ids — important because some
 * guids (e.g. UUIDs ending in digits) would otherwise extract a colliding number.
 *
 * When the same episode appears in more than one feed (same normalized title),
 * the earlier (higher-priority) feed wins, so progress continuity is preserved.
 */
interface FeedSource {
  url: string;
  idMode: "numeric" | "guid";
  idPrefix?: string;
}

const FEEDS: FeedSource[] = [
  // Primary archive — keep numeric ids untouched (existing progress depends on them).
  { url: "https://rss.jewishpodcasts.fm/rss/435", idMode: "numeric" },
  // "Bitachon with R' Odom Silverstein" — newer Weekly Bitachon Chabura.
  { url: "https://anchor.fm/s/112959698/podcast/rss", idMode: "guid", idPrefix: "anchor-" },
];

interface RssItem {
  title: string;
  link: string;
  guid: string | { "#text": string };
  pubDate: string;
  description: string;
  enclosure: { "@_url": string; "@_length": string; "@_type": string };
  "itunes:duration"?: string;
  "dc:creator"?: string;
}

function parseDuration(duration: string | undefined): { formatted: string; seconds: number } {
  if (!duration) return { formatted: "0:00", seconds: 0 };
  const parts = duration.split(":").map(Number);
  let seconds = 0;
  if (parts.length === 3) {
    seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    seconds = parts[0] * 60 + parts[1];
  } else {
    seconds = parts[0] || 0;
  }
  return { formatted: duration, seconds };
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

function normalizeTitle(title: string): string {
  return title.toLowerCase().replace(/\s+/g, " ").trim();
}

function rssItemToShiur(item: RssItem, feed: FeedSource): Shiur {
  const { formatted, seconds } = parseDuration(item["itunes:duration"]);
  const guidText = typeof item.guid === "string" ? item.guid : item.guid?.["#text"] || "";

  let id: string;
  if (feed.idMode === "numeric") {
    // Primary feed: preserve the original id derivation exactly.
    const idMatch = guidText.match(/(\d+)$/);
    id = idMatch ? idMatch[1] : guidText;
  } else {
    // Secondary feeds: namespace by full guid so ids are globally unique and stable.
    id = `${feed.idPrefix ?? ""}${guidText}`;
  }

  const title = typeof item.title === "string" ? item.title : String(item.title || "");

  return {
    id,
    title,
    audioUrl: item.enclosure?.["@_url"] || "",
    duration: formatted,
    durationSeconds: seconds,
    pubDate: new Date(item.pubDate).toISOString(),
    description: stripHtml(typeof item.description === "string" ? item.description : ""),
    link: typeof item.link === "string" ? item.link : "",
    categoryId: "general",
  };
}

async function fetchOneFeed(feed: FeedSource): Promise<Shiur[]> {
  try {
    const res = await fetch(feed.url, { cache: "no-store" });
    if (!res.ok) {
      console.error(`RSS fetch failed (${feed.url}): ${res.status}`);
      return [];
    }
    const xml = await res.text();

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
    });
    const parsed = parser.parse(xml);

    const items: RssItem[] = parsed?.rss?.channel?.item || [];
    if (!Array.isArray(items)) {
      // A channel with a single <item> parses to an object, not an array.
      return items ? [rssItemToShiur(items as RssItem, feed)] : [];
    }

    return items.map((item) => rssItemToShiur(item, feed));
  } catch (err) {
    // One failing feed must never blank the site — return empty and keep the others.
    console.error(`RSS fetch error (${feed.url}):`, err);
    return [];
  }
}

async function fetchAndParseRss(): Promise<Shiur[]> {
  // Fetch every feed independently and in parallel; a failure in one is isolated.
  const perFeed = await Promise.all(FEEDS.map(fetchOneFeed));

  // Merge with title-based dedup. Iterate feeds in REVERSE priority order so that
  // the earlier (higher-priority) feed overwrites later ones for shared titles —
  // i.e. the primary feed's episode (and its progress-bearing id) always wins.
  const byTitle = new Map<string, Shiur>();
  for (let i = perFeed.length - 1; i >= 0; i--) {
    for (const shiur of perFeed[i]) {
      const key = normalizeTitle(shiur.title);
      if (key) byTitle.set(key, shiur);
    }
  }

  return Array.from(byTitle.values()).sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );
}

export const fetchFromRss = unstable_cache(fetchAndParseRss, ["rss-shiurim-v2"], {
  revalidate: 3600,
});
