import { XMLParser } from "fast-xml-parser";
import { unstable_cache } from "next/cache";
import type { Shiur } from "./types";

const RSS_URL = "https://rss.jewishpodcasts.fm/rss/435";

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

function rssItemToShiur(item: RssItem): Shiur {
  const { formatted, seconds } = parseDuration(item["itunes:duration"]);
  const guidText = typeof item.guid === "string" ? item.guid : item.guid?.["#text"] || "";
  const idMatch = guidText.match(/(\d+)$/);
  const id = idMatch ? idMatch[1] : guidText;

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

async function fetchAndParseRss(): Promise<Shiur[]> {
  try {
    const res = await fetch(RSS_URL, { cache: "no-store" });
    if (!res.ok) {
      console.error(`RSS fetch failed: ${res.status}`);
      return [];
    }
    const xml = await res.text();

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
    });
    const parsed = parser.parse(xml);

    const items: RssItem[] = parsed?.rss?.channel?.item || [];
    if (!Array.isArray(items)) return [];

    return items.map(rssItemToShiur);
  } catch (err) {
    console.error("RSS fetch error:", err);
    return [];
  }
}

export const fetchFromRss = unstable_cache(fetchAndParseRss, ["rss-shiurim"], {
  revalidate: 3600,
});
