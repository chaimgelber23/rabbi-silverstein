import type { Shiur } from "@/lib/types";

const SITE_URL = "https://rabbi-silverstein.vercel.app";

interface SeriesJsonLdProps {
  slug: string;
  name: string;
  description?: string;
  shiurim: Shiur[];
}

export function SeriesJsonLd({ slug, name, description, shiurim }: SeriesJsonLdProps) {
  const seriesUrl = `${SITE_URL}/shiurim/${slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "PodcastSeries",
    name: `${name} — Rabbi Odom Silverstein`,
    description: description || `Torah shiurim on ${name} by Rabbi Odom Silverstein.`,
    url: seriesUrl,
    author: {
      "@type": "Person",
      name: "Rabbi Odom Silverstein",
    },
    episode: shiurim.slice(0, 50).map((shiur, i) => ({
      "@type": "PodcastEpisode",
      name: shiur.title,
      url: seriesUrl,
      datePublished: shiur.pubDate || undefined,
      timeRequired: shiur.duration ? `PT${parseDuration(shiur.duration)}` : undefined,
      associatedMedia: {
        "@type": "AudioObject",
        contentUrl: shiur.audioUrl,
        encodingFormat: "audio/mpeg",
      },
      position: i + 1,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

function parseDuration(dur: string): string {
  // Convert "1:23:45" or "23:45" to ISO 8601 duration like "1H23M45S"
  const parts = dur.split(":").map(Number);
  if (parts.length === 3) return `${parts[0]}H${parts[1]}M${parts[2]}S`;
  if (parts.length === 2) return `${parts[0]}M${parts[1]}S`;
  return `${parts[0]}M`;
}
