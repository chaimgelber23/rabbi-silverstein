// Server-only: merges hardcoded series/groups with custom Firestore data.
// Do NOT import this file from client components ("use client").

import { SERIES, SERIES_GROUPS } from "./seriesConfig";
import { fetchCustomSeries, fetchCustomGroups } from "./customData";
import type { CustomSeriesDef } from "./customData";
import type { SeriesDef, SeriesGroup } from "./types";

function customToSeriesDef(custom: CustomSeriesDef): SeriesDef {
  return {
    slug: custom.slug,
    name: custom.name,
    description: custom.description,
    group: custom.group as SeriesGroup,
    navType: custom.navType,
    sortDefault: custom.sortDefault,
    displayOrder: custom.displayOrder,
    patterns: [], // custom series match by categoryId, not patterns
  };
}

export async function getAllSeriesWithCustom(): Promise<SeriesDef[]> {
  const customSeries = await fetchCustomSeries();
  const customDefs = customSeries.map(customToSeriesDef);
  const result = [...SERIES];
  // Insert custom series before the catch-all "other"
  const otherIndex = result.findIndex((s) => s.slug === "other");
  if (otherIndex !== -1) {
    result.splice(otherIndex, 0, ...customDefs);
  } else {
    result.push(...customDefs);
  }
  return result;
}

export async function getAllGroupsWithCustom(): Promise<
  Record<string, { label: string; description: string }>
> {
  const customGroups = await fetchCustomGroups();
  const allGroups: Record<string, { label: string; description: string }> = {
    ...(SERIES_GROUPS as Record<string, { label: string; description: string }>),
  };
  for (const g of customGroups) {
    allGroups[g.slug] = { label: g.label, description: g.description };
  }
  return allGroups;
}

export async function getAllSlugsWithCustom(): Promise<string[]> {
  const allSeries = await getAllSeriesWithCustom();
  const allGroups = await getAllGroupsWithCustom();
  return [...allSeries.map((s) => s.slug), ...Object.keys(allGroups)];
}

export async function getSeriesBySlugWithCustom(
  slug: string
): Promise<SeriesDef | undefined> {
  // Check hardcoded first (fast path)
  const hardcoded = SERIES.find((s) => s.slug === slug);
  if (hardcoded) return hardcoded;

  // Check custom series
  const customSeries = await fetchCustomSeries();
  const custom = customSeries.find((s) => s.slug === slug);
  return custom ? customToSeriesDef(custom) : undefined;
}

export async function getGroupInfoWithCustom(
  groupId: string
): Promise<{ label: string; description: string } | undefined> {
  // Check hardcoded first
  const hardcoded = (
    SERIES_GROUPS as Record<string, { label: string; description: string }>
  )[groupId];
  if (hardcoded) return hardcoded;

  // Check custom groups
  const customGroups = await fetchCustomGroups();
  const custom = customGroups.find((g) => g.slug === groupId);
  return custom
    ? { label: custom.label, description: custom.description }
    : undefined;
}
