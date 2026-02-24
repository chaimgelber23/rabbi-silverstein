import { fetchAllShiurim } from "./shiurim";
import { SERIES, SERIES_GROUPS } from "./seriesConfig";
import type { Shiur, SeriesStats } from "./types";

export async function getSeriesShiurim(slug: string): Promise<Shiur[]> {
  const series = SERIES.find((s) => s.slug === slug);
  if (!series) return [];

  const allShiurim = await fetchAllShiurim();
  return allShiurim.filter((shiur) =>
    series.patterns.some((p) => p.test(shiur.title))
  );
}

export async function getLandingData(): Promise<{
  ungrouped: SeriesStats[];
  groups: {
    id: string;
    label: string;
    description: string;
    series: SeriesStats[];
  }[];
  totalCount: number;
  latestShiurim: Shiur[];
}> {
  const allShiurim = await fetchAllShiurim();

  const allStats: SeriesStats[] = [];

  for (const series of SERIES) {
    const matching = allShiurim.filter((shiur) =>
      series.patterns.some((p) => p.test(shiur.title))
    );

    if (matching.length > 0) {
      const latestDate = matching.reduce(
        (latest, s) => (s.pubDate > latest ? s.pubDate : latest),
        matching[0].pubDate
      );

      allStats.push({
        slug: series.slug,
        name: series.name,
        description: series.description,
        group: series.group,
        episodeCount: matching.length,
        latestDate,
        displayOrder: series.displayOrder,
      });
    }
  }

  const ungrouped = allStats
    .filter((s) => s.group === null)
    .sort((a, b) => b.episodeCount - a.episodeCount);

  const groups = (
    Object.entries(SERIES_GROUPS) as [
      string,
      { label: string; description: string },
    ][]
  )
    .map(([id, meta]) => ({
      id,
      label: meta.label,
      description: meta.description,
      series: allStats
        .filter((s) => s.group === id)
        .sort((a, b) => {
          if (a.displayOrder != null && b.displayOrder != null)
            return a.displayOrder - b.displayOrder;
          if (a.displayOrder != null) return -1;
          if (b.displayOrder != null) return 1;
          return b.episodeCount - a.episodeCount;
        }),
    }))
    .filter((g) => g.series.length > 0);

  return {
    ungrouped,
    groups,
    totalCount: allShiurim.length,
    latestShiurim: allShiurim.slice(0, 6),
  };
}

export async function getSeriesNavSections(slug: string): Promise<string[]> {
  const series = SERIES.find((s) => s.slug === slug);
  if (!series?.extractNav) return [];

  const shiurim = await getSeriesShiurim(slug);
  const sections = new Set<string>();

  for (const shiur of shiurim) {
    const nav = series.extractNav(shiur.title);
    if (nav.section) sections.add(nav.section);
  }

  return Array.from(sections).sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, ""));
    const numB = parseInt(b.replace(/\D/g, ""));
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return a.localeCompare(b);
  });
}
