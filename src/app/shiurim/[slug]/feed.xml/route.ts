import { getSeriesShiurim, getGroupShiurim } from "@/lib/seriesData";
import { getSeriesBySlugWithCustom, getGroupInfoWithCustom } from "@/lib/seriesConfigServer";
import { SITE_URL } from "@/lib/site";
import type { Shiur } from "@/lib/types";

// Per-series podcast RSS feed (RSS 2.0 + iTunes namespace) so a learner can
// subscribe to one sefer in any podcast app and get each new shiur delivered.
// Served at /shiurim/[slug]/feed.xml. ISR-cached hourly like the rest of the site.
export const revalidate = 3600;

function esc(s: string): string {
  return s
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

async function resolve(
  slug: string
): Promise<{ name: string; description: string; shiurim: Shiur[] } | null> {
  const group = await getGroupInfoWithCustom(slug);
  if (group) return { name: group.label, description: group.description, shiurim: await getGroupShiurim(slug) };
  const series = await getSeriesBySlugWithCustom(slug);
  if (series) return { name: series.name, description: series.description, shiurim: await getSeriesShiurim(slug) };
  return null;
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await resolve(slug);
  if (!data) return new Response("Not found", { status: 404 });

  const channelTitle = `${data.name} — Rabbi Odom Silverstein`;
  const channelLink = `${SITE_URL}/shiurim/${slug}`;
  const feedUrl = `${SITE_URL}/shiurim/${slug}/feed.xml`;
  const channelDesc = data.description || `Torah shiurim on ${data.name} by Rabbi Odom Silverstein.`;
  const image = `${SITE_URL}/rabbi-silverstein.jpg`;

  const sorted = [...data.shiurim].sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );

  const items = sorted
    .map((s) => {
      const itemLink = `${SITE_URL}/shiurim/${slug}/${encodeURIComponent(s.id)}`;
      const desc = (s.summary || s.description || "").trim();
      const dur = s.durationSeconds > 0 ? String(s.durationSeconds) : "";
      return `    <item>
      <title>${esc(s.title)}</title>
      <link>${esc(itemLink)}</link>
      <guid isPermaLink="false">${esc(s.id)}</guid>
      <pubDate>${new Date(s.pubDate).toUTCString()}</pubDate>${desc ? `\n      <description>${esc(desc)}</description>` : ""}
      <enclosure url="${esc(s.audioUrl)}" length="0" type="${audioType(s.audioUrl)}" />${dur ? `\n      <itunes:duration>${dur}</itunes:duration>` : ""}
      <itunes:author>Rabbi Odom Silverstein</itunes:author>
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
    <language>en</language>
    <atom:link href="${esc(feedUrl)}" rel="self" type="application/rss+xml" />
    <itunes:author>Rabbi Odom Silverstein</itunes:author>
    <itunes:summary>${esc(channelDesc)}</itunes:summary>
    <itunes:type>episodic</itunes:type>
    <itunes:explicit>false</itunes:explicit>
    <itunes:image href="${esc(image)}" />
    <image>
      <url>${esc(image)}</url>
      <title>${esc(channelTitle)}</title>
      <link>${esc(channelLink)}</link>
    </image>
    <itunes:category text="Religion &amp; Spirituality">
      <itunes:category text="Judaism" />
    </itunes:category>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
