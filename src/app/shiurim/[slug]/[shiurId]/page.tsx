import { notFound } from "next/navigation";
import Link from "next/link";
import type { Shiur } from "@/lib/types";
import { getShiurById, getSeriesShiurim, getGroupShiurim } from "@/lib/seriesData";
import { getSeriesBySlugWithCustom, getGroupInfoWithCustom } from "@/lib/seriesConfigServer";
import ShiurActions from "@/components/shiurim/ShiurActions";

export const revalidate = 3600;

const SITE_URL = "https://rabbiodomsilverstein.com";

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function fmtDuration(d: string): string {
  const p = d.split(":").map(Number);
  if (p.length === 3) return p[0] > 0 ? `${p[0]}h ${p[1]}m` : `${p[1]} min`;
  if (p.length === 2) return `${p[0]} min`;
  return d;
}

async function loadContext(
  slug: string,
  id: string
): Promise<{ shiur: Shiur | null; seriesName: string | null; seriesShiurim: Shiur[] }> {
  const shiur = await getShiurById(id);
  if (!shiur) return { shiur: null, seriesName: null, seriesShiurim: [] };

  const group = await getGroupInfoWithCustom(slug);
  if (group) {
    return { shiur, seriesName: group.label, seriesShiurim: await getGroupShiurim(slug) };
  }
  const series = await getSeriesBySlugWithCustom(slug);
  if (series) {
    return { shiur, seriesName: series.name, seriesShiurim: await getSeriesShiurim(slug) };
  }
  return { shiur, seriesName: null, seriesShiurim: [] };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; shiurId: string }>;
}) {
  const { slug, shiurId } = await params;
  const id = decodeURIComponent(shiurId);
  const shiur = await getShiurById(id);
  if (!shiur) return {};

  const description = (shiur.description?.trim() || `${shiur.title} — a Torah shiur by Rabbi Odom Silverstein.`).slice(0, 300);
  const canonical = `/shiurim/${slug}/${encodeURIComponent(id)}`;
  return {
    title: shiur.title,
    description,
    alternates: { canonical },
    openGraph: { title: `${shiur.title} | Rabbi Odom Silverstein`, description, url: `${SITE_URL}${canonical}`, type: "article" as const },
    twitter: { card: "summary" as const, title: shiur.title, description: description.slice(0, 200) },
  };
}

export default async function ShiurPage({
  params,
}: {
  params: Promise<{ slug: string; shiurId: string }>;
}) {
  const { slug, shiurId } = await params;
  const id = decodeURIComponent(shiurId);
  const { shiur, seriesName, seriesShiurim } = await loadContext(slug, id);
  if (!shiur) notFound();

  const ordered = [...seriesShiurim].sort(
    (a, b) => new Date(a.pubDate).getTime() - new Date(b.pubDate).getTime()
  );
  const idx = ordered.findIndex((s) => s.id === shiur.id);
  const prev = idx > 0 ? ordered[idx - 1] : null;
  const next = idx >= 0 && idx < ordered.length - 1 ? ordered[idx + 1] : null;

  const summary = shiur.summary?.trim() || shiur.description?.trim();
  const takeaway = shiur.takeaway?.trim();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "PodcastEpisode",
    name: shiur.title,
    datePublished: shiur.pubDate,
    timeRequired: `PT${Math.max(1, Math.round(shiur.durationSeconds / 60))}M`,
    description: summary || `${shiur.title} by Rabbi Odom Silverstein.`,
    url: `${SITE_URL}/shiurim/${slug}/${encodeURIComponent(shiur.id)}`,
    associatedMedia: { "@type": "AudioObject", contentUrl: shiur.audioUrl },
    ...(seriesName ? { partOfSeries: { "@type": "PodcastSeries", name: seriesName } } : {}),
    author: { "@type": "Person", name: "Rabbi Odom Silverstein" },
  };

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="bg-brown py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <nav className="text-sm text-white/50 mb-6">
            <Link href="/" className="hover:text-amber transition-colors">Shiurim</Link>
            {seriesName && (
              <>
                <span className="mx-2">/</span>
                <Link href={`/shiurim/${slug}`} className="hover:text-amber transition-colors">{seriesName}</Link>
              </>
            )}
          </nav>
          <h1 className="serif-heading text-amber text-3xl md:text-4xl font-bold mb-4 leading-tight">{shiur.title}</h1>
          <p className="text-white/50 text-sm">{fmtDate(shiur.pubDate)} &middot; {fmtDuration(shiur.duration)}</p>
        </div>
      </section>

      <section className="py-10 px-6 bg-cream">
        <div className="max-w-3xl mx-auto">
          <ShiurActions shiur={shiur} seriesSlug={slug} seriesShiurim={ordered} />

          {summary ? (
            <div className="mt-8 bg-white border border-amber/15 rounded-xl p-6">
              <h2 className="serif-heading text-brown text-xl font-bold mb-3">About this shiur</h2>
              <p className="text-brown/80 leading-relaxed whitespace-pre-line">{summary}</p>
            </div>
          ) : null}

          {takeaway ? (
            <div className="mt-4 bg-amber/5 border border-amber/20 rounded-xl p-5">
              <h3 className="text-amber-text font-bold text-xs uppercase tracking-wider mb-2">Key takeaway</h3>
              <p className="text-brown/80 leading-relaxed whitespace-pre-line">{takeaway}</p>
            </div>
          ) : null}

          {(prev || next) && (
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {prev ? (
                <Link
                  href={`/shiurim/${slug}/${encodeURIComponent(prev.id)}`}
                  className="block bg-white border border-amber/15 rounded-xl p-4 hover:border-amber/30 hover:shadow-md transition-all"
                >
                  <span className="text-brown/50 text-xs uppercase tracking-wider">Previous</span>
                  <p className="text-brown font-semibold text-sm mt-1 line-clamp-2">{prev.title}</p>
                </Link>
              ) : (
                <div className="hidden sm:block" />
              )}
              {next ? (
                <Link
                  href={`/shiurim/${slug}/${encodeURIComponent(next.id)}`}
                  className="block bg-white border border-amber/15 rounded-xl p-4 hover:border-amber/30 hover:shadow-md transition-all sm:text-right"
                >
                  <span className="text-brown/50 text-xs uppercase tracking-wider">Next</span>
                  <p className="text-brown font-semibold text-sm mt-1 line-clamp-2">{next.title}</p>
                </Link>
              ) : null}
            </div>
          )}

          <div className="mt-10">
            <Link
              href={seriesName ? `/shiurim/${slug}` : "/"}
              className="text-amber-text font-semibold text-sm hover:text-brown transition-colors"
            >
              &larr; Back to {seriesName || "all shiurim"}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
