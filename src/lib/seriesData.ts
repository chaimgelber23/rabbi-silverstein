import { fetchAllShiurim } from "./shiurim";
import { getAllSeriesWithCustom, getAllGroupsWithCustom } from "./seriesConfigServer";
import type { Shiur, SeriesStats } from "./types";

export async function getSeriesShiurim(slug: string): Promise<Shiur[]> {
  const allSeries = await getAllSeriesWithCustom();
  const series = allSeries.find((s) => s.slug === slug);
  if (!series) return [];

  const allShiurim = await fetchAllShiurim();

  if (series.patterns.length > 0) {
    // RSS-based series: match by title patterns
    return allShiurim.filter((shiur) =>
      series.patterns.some((p) => p.test(shiur.title))
    );
  } else {
    // Custom series: match by categoryId (set to seriesSlug on upload)
    return allShiurim.filter((shiur) => shiur.categoryId === slug);
  }
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
  const allSeries = await getAllSeriesWithCustom();
  const allGroups = await getAllGroupsWithCustom();

  const allStats: SeriesStats[] = [];

  for (const series of allSeries) {
    let matching: Shiur[];

    if (series.patterns.length > 0) {
      matching = allShiurim.filter((shiur) =>
        series.patterns.some((p) => p.test(shiur.title))
      );
    } else {
      matching = allShiurim.filter(
        (shiur) => shiur.categoryId === series.slug
      );
    }

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

  const groups = Object.entries(allGroups)
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

export async function getGroupShiurim(groupId: string): Promise<Shiur[]> {
  const allShiurim = await fetchAllShiurim();
  const allSeries = await getAllSeriesWithCustom();

  // Get all series in this group
  const groupSeries = allSeries.filter((s) => s.group === groupId);
  if (groupSeries.length === 0) return [];

  // Collect matching shiurim from all series in the group
  return allShiurim.filter((shiur) =>
    groupSeries.some((series) => {
      if (series.patterns.length > 0) {
        return series.patterns.some((p) => p.test(shiur.title));
      }
      return shiur.categoryId === series.slug;
    })
  );
}

export async function getSeriesNavSections(slug: string): Promise<string[]> {
  const allSeries = await getAllSeriesWithCustom();
  const series = allSeries.find((s) => s.slug === slug);
  if (!series?.extractNav) {
    // For custom perek-based series, extract perek numbers from title
    if (series && series.navType === "perek" && series.patterns.length === 0) {
      const shiurim = await getSeriesShiurim(slug);
      const sections = new Set<string>();
      for (const shiur of shiurim) {
        const perekMatch = shiur.title.match(/Perek\s+(\d+)/i);
        if (perekMatch) sections.add(`Perek ${perekMatch[1]}`);
      }
      return Array.from(sections).sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, ""));
        const numB = parseInt(b.replace(/\D/g, ""));
        return numA - numB;
      });
    }
    return [];
  }

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
