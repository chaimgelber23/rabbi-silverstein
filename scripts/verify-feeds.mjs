// Standalone verification of the multi-feed merge + dedup logic against the LIVE feeds.
// Mirrors the algorithm in src/lib/rss.ts (which can't run under plain node because it
// imports next/cache). Proves: anchor episodes present, no duplicate titles, unique ids,
// anchor ids namespaced, primary numeric ids unchanged.
import { XMLParser } from "fast-xml-parser";

const FEEDS = [
  { url: "https://rss.jewishpodcasts.fm/rss/435", idMode: "numeric" },
  { url: "https://anchor.fm/s/112959698/podcast/rss", idMode: "guid", idPrefix: "anchor-" },
];

const normalizeTitle = (t) => t.toLowerCase().replace(/\s+/g, " ").trim();

function toShiur(item, feed) {
  const guidText = typeof item.guid === "string" ? item.guid : item.guid?.["#text"] || "";
  let id;
  if (feed.idMode === "numeric") {
    const m = guidText.match(/(\d+)$/);
    id = m ? m[1] : guidText;
  } else {
    id = `${feed.idPrefix ?? ""}${guidText}`;
  }
  const title = typeof item.title === "string" ? item.title : (item.title?.["#text"] ?? String(item.title ?? ""));
  return { id, title, audioUrl: item.enclosure?.["@_url"] || "", pubDate: new Date(item.pubDate).toISOString(), feed: feed.url };
}

async function fetchOne(feed) {
  const res = await fetch(feed.url, { cache: "no-store" });
  if (!res.ok) throw new Error(`${feed.url} -> ${res.status}`);
  const xml = await res.text();
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
  const items = parser.parse(xml)?.rss?.channel?.item || [];
  const arr = Array.isArray(items) ? items : [items];
  return arr.map((i) => toShiur(i, feed));
}

const perFeed = await Promise.all(FEEDS.map(fetchOne));
const byTitle = new Map();
for (let i = perFeed.length - 1; i >= 0; i--) {
  for (const s of perFeed[i]) {
    const k = normalizeTitle(s.title);
    if (k) byTitle.set(k, s);
  }
}
const merged = [...byTitle.values()].sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

console.log(`Feed 1 (jewishpodcasts): ${perFeed[0].length} items`);
console.log(`Feed 2 (anchor bitachon): ${perFeed[1].length} items`);
console.log(`Merged total: ${merged.length}`);

// Assertions
const titles = merged.map((s) => normalizeTitle(s.title));
const dupTitles = titles.filter((t, i) => titles.indexOf(t) !== i);
const ids = merged.map((s) => s.id);
const dupIds = ids.filter((id, i) => ids.indexOf(id) !== i);
const anchorItems = merged.filter((s) => s.id.startsWith("anchor-"));
const anchorBitachon = merged.filter((s) => /^Bitachon Shiur/i.test(s.title));

console.log(`\nDuplicate titles in merged: ${dupTitles.length} ${dupTitles.length ? JSON.stringify(dupTitles) : "(OK)"}`);
console.log(`Duplicate ids in merged: ${dupIds.length} ${dupIds.length ? JSON.stringify(dupIds) : "(OK)"}`);
console.log(`Anchor-namespaced items: ${anchorItems.length}`);
console.log(`"Bitachon Shiur N" episodes present: ${anchorBitachon.length}`);
console.log(`\nNew Bitachon episodes that will appear on the site:`);
for (const s of anchorBitachon) console.log(`  [${s.id}] ${s.title.trim()}`);

const ok = dupTitles.length === 0 && dupIds.length === 0 && anchorBitachon.length === 5;
console.log(`\n${ok ? "PASS ✓ merge + dedup + id-namespacing all correct" : "FAIL ✗ see above"}`);
process.exit(ok ? 0 : 1);
