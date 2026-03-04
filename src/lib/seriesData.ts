import { fetchAllShiurim } from "./shiurim";
import { getAllSeriesWithCustom, getAllGroupsWithCustom } from "./seriesConfigServer";
import { YOM_TOV_ORDER } from "./seriesConfig";
import type { Shiur, SeriesStats } from "./types";

export async function getSeriesShiurim(slug: string): Promise<Shiur[]> {
  const allSeries = await getAllSeriesWithCustom();
  const series = allSeries.find((s) => s.slug === slug);
  if (!series) return [];

  const allShiurim = await fetchAllShiurim();

  if (slug === "other") {
    return allShiurim.map((shiur) => {
      const isClaimed = allSeries.some(
        (s) =>
          s.slug !== "other" &&
          (shiur.categoryId === s.slug ||
            (s.patterns.length > 0 && s.patterns.some((p) => p.test(shiur.title))))
      );
      return {
        ...shiur,
        isUncategorized: !isClaimed,
      };
    });
  }

  let matched: Shiur[];
  if (series.patterns.length > 0) {
    // Match by title patterns OR explicit categoryId assignment
    matched = allShiurim.filter((shiur) =>
      shiur.categoryId === slug || series.patterns.some((p) => p.test(shiur.title))
    );
  } else {
    // Custom series: match by categoryId (set to seriesSlug on upload)
    matched = allShiurim.filter((shiur) => shiur.categoryId === slug);
  }

  // For topic-type series (e.g. holidays, parsha), pre-compute each shiur's nav section
  // so the client can filter accurately without relying on title substrings alone.
  if (series.navType === "topic" && series.extractNav) {
    return matched.map((shiur) => ({
      ...shiur,
      navSection: series.extractNav!(shiur).section,
    }));
  }

  return matched;
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

    if (series.slug === "other") {
      matching = allShiurim;
    } else if (series.patterns.length > 0) {
      matching = allShiurim.filter((shiur) =>
        shiur.categoryId === series.slug || series.patterns.some((p) => p.test(shiur.title))
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
        return shiur.categoryId === series.slug || series.patterns.some((p) => p.test(shiur.title));
      }
      return shiur.categoryId === series.slug;
    })
  );
}

export async function getSeriesNavSections(slug: string): Promise<string[]> {
  if (slug === "other") {
    const shiurim = await getSeriesShiurim("other");
    return shiurim.some((s) => s.isUncategorized) ? ["Uncategorized"] : [];
  }

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
    const nav = series.extractNav(shiur);
    if (nav.section) sections.add(nav.section);
  }

  return Array.from(sections).sort((a, b) => {
    if (slug === "holidays") {
      const idxA = YOM_TOV_ORDER.indexOf(a);
      const idxB = YOM_TOV_ORDER.indexOf(b);
      // If a section is not in YOM_TOV_ORDER, handle putting it at the end but before "Other Yamim Tovim"
      const safeIdxA = idxA !== -1 ? idxA : YOM_TOV_ORDER.indexOf("Other Yamim Tovim") - 0.5;
      const safeIdxB = idxB !== -1 ? idxB : YOM_TOV_ORDER.indexOf("Other Yamim Tovim") - 0.5;

      if (safeIdxA !== safeIdxB) return safeIdxA - safeIdxB;
      // Fallback to alphabetical if both aren't found
      return a.localeCompare(b);
    }

    const numA = parseInt(a.replace(/\D/g, ""));
    const numB = parseInt(b.replace(/\D/g, ""));
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return a.localeCompare(b);
  });
}
