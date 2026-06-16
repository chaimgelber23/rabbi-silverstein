import { getSeriesShiurim, getGroupShiurim } from "@/lib/seriesData";
import { getSeriesBySlugWithCustom, getGroupInfoWithCustom } from "@/lib/seriesConfigServer";
import { SITE_URL } from "@/lib/site";
import type { Shiur } from "@/lib/types";

// Per-series podcast RSS feed (RSS 2.0 + iTunes namespace), Apple/Spotify-grade.
// Served at /shiurim/[slug]/feed.xml so a learner can subscribe to one sefer in
// any podcast app and get each new shiur delivered. ISR-cached hourly.
export const revalidate = 3600;

const OWNER_NAME = "Rabbi Odom Silverstein";
const OWNER_EMAIL = "odsilverstein@gmail.com";

function esc(s: string): string {
  // Strip XML-illegal control chars (item text comes from an external feed we
  // don't control — one stray byte would make the whole feed unparseable).
  // Keep tab (9), LF (10), CR (13); drop everything else below 0x20.
  let clean = "";
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c > 31 || c === 9 || c === 10 || c === 13) clean += s[i];
  }
  return clean
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function audioType(url: string): string {
  const u = url.toLowerCase();
  if (u.includes(".m4a") || u.includes(".mp4") || u.includes(".m4b")) return "audio/x-m4a";
  if (u.includes(".wav")) return "audio/wav";
  if (u.includes(".ogg")) return "audio/ogg";
  return "audio/mpeg";
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

async function resolve(
  slug: string
): Promise<{ name: string; description: string; shiurim: Shiur[] } | null> {
  const group = await getGroupInfoWithCustom(slug);
  if (group) return { name: group.label, description: group.description, shiurim: await getGroupShiurim(slug) };
  const series = await getSeriesBySlugWithCustom(slug);
  if (series) return { name: series.name, description: series.description, shiurim: await getSeriesShiurim(slug) };
  return null;
}

function feedResponse(xml: string, sMaxAge = 3600): Response {
  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": `public, max-age=0, s-maxage=${sMaxAge}, stale-while-revalidate=86400`,
    },
  });
}

const OWNER_BLOCK = `    <itunes:author>${esc(OWNER_NAME)}</itunes:author>
    <itunes:owner>
      <itunes:name>${esc(OWNER_NAME)}</itunes:name>
      <itunes:email>${OWNER_EMAIL}</itunes:email>
    </itunes:owner>
    <itunes:type>episodic</itunes:type>
    <itunes:explicit>false</itunes:explicit>
    <itunes:category text="Religion &amp; Spirituality">
      <itunes:category text="Judaism" />
    </itunes:category>`;

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const channelLink = `${SITE_URL}/shiurim/${slug}`;
  const feedUrl = `${SITE_URL}/shiurim/${slug}/feed.xml`;
  const image = `${SITE_URL}/rabbi-silverstein.jpg`;

  try {
    const data = await resolve(slug);
    if (!data) return new Response("Not found", { status: 404 });

    const channelTitle = `${data.name} — ${OWNER_NAME}`;
    const channelDesc = data.description || `Torah shiurim on ${data.name} by ${OWNER_NAME}.`;
    const sorted = [...data.shiurim].sort(
      (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );
    const lastBuild = sorted.length ? new Date(sorted[0].pubDate).toUTCString() : "";

    const items = sorted
      .map((s) => {
        const itemLink = `${SITE_URL}/shiurim/${slug}/${encodeURIComponent(s.id)}`;
        const desc =
          (s.summary || s.description || "").trim() ||
          `Shiur from ${data.name} by ${OWNER_NAME}, ${fmtDate(s.pubDate)}.`;
        // Nonzero byte length: the real size needs a per-file HEAD (too costly on
        // the 400-item hourly rebuild) so estimate from duration (~128 kbps). Any
        // nonzero value clears validators; compliant players HEAD the URL to seek.
        const bytes = s.durationSeconds > 0 ? s.durationSeconds * 16000 : 1;
        const dur = s.durationSeconds > 0 ? `\n      <itunes:duration>${s.durationSeconds}</itunes:duration>` : "";
        return `    <item>
      <title>${esc(s.title)}</title>
      <link>${esc(itemLink)}</link>
      <guid isPermaLink="false">${esc(s.id)}</guid>
      <pubDate>${new Date(s.pubDate).toUTCString()}</pubDate>
      <description>${esc(desc)}</description>
      <itunes:summary>${esc(desc)}</itunes:summary>
      <enclosure url="${esc(s.audioUrl)}" length="${bytes}" type="${audioType(s.audioUrl)}" />${dur}
      <itunes:author>${esc(OWNER_NAME)}</itunes:author>
      <itunes:explicit>false</itunes:explicit>
    </item>`;
      })
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(channelTitle)}</title>
    <link>${esc(channelLink)}</link>
    <description>${esc(channelDesc)}</description>
    <itunes:subtitle>${esc(channelDesc)}</itunes:subtitle>
    <itunes:summary>${esc(channelDesc)}</itunes:summary>
    <language>en</language>
    <copyright>© ${esc(OWNER_NAME)}</copyright>
    <generator>Next.js</generator>${lastBuild ? `\n    <lastBuildDate>${lastBuild}</lastBuildDate>` : ""}
    <atom:link href="${esc(feedUrl)}" rel="self" type="application/rss+xml" />
${OWNER_BLOCK}
    <itunes:image href="${esc(image)}" />
    <image>
      <url>${esc(image)}</url>
      <title>${esc(channelTitle)}</title>
      <link>${esc(channelLink)}</link>
    </image>
${items}
  </channel>
</rss>`;

    return feedResponse(xml);
  } catch {
    // Upstream feeds down + cold cache → serve a valid (empty) feed, never a 500,
    // so a polling platform/validator doesn't mark the show dead. Self-heals.
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(OWNER_NAME)} — Torah Shiurim</title>
    <link>${esc(channelLink)}</link>
    <description>Torah shiurim by ${esc(OWNER_NAME)}.</description>
    <language>en</language>
    <atom:link href="${esc(feedUrl)}" rel="self" type="application/rss+xml" />
${OWNER_BLOCK}
    <itunes:image href="${esc(image)}" />
  </channel>
</rss>`;
    return feedResponse(xml, 60);
  }
}
