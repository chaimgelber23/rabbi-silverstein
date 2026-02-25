import { notFound } from "next/navigation";
import { getSeriesShiurim, getSeriesNavSections, getGroupShiurim } from "@/lib/seriesData";
import { getAllSlugs } from "@/lib/seriesConfig";
import {
  getSeriesBySlugWithCustom,
  getGroupInfoWithCustom,
} from "@/lib/seriesConfigServer";
import SeriesPageClient from "@/components/shiurim/SeriesPageClient";

export const revalidate = 3600;

export async function generateStaticParams() {
  // Only pre-render hardcoded slugs at build time
  // Custom slugs render on-demand via ISR (dynamicParams = true by default)
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const series = await getSeriesBySlugWithCustom(slug);
  if (series) {
    return { title: `${series.name} | Rabbi Odom Silverstein`, description: series.description };
  }
  const group = await getGroupInfoWithCustom(slug);
  if (group) {
    return { title: `${group.label} | Rabbi Odom Silverstein`, description: group.description };
  }
  return {};
}

export default async function SeriesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Check if it's a group slug (e.g., "nefesh-hachaim", "tanya", "bitachon")
  const group = await getGroupInfoWithCustom(slug);
  if (group) {
    const shiurim = await getGroupShiurim(slug);
    return (
      <SeriesPageClient
        series={{
          slug,
          name: group.label,
          description: group.description,
          group: slug,
          navType: "sequential",
          sortDefault: "oldest",
        }}
        shiurim={shiurim}
        navSections={[]}
      />
    );
  }

  // Regular series slug
  const series = await getSeriesBySlugWithCustom(slug);
  if (!series) notFound();

  const [shiurim, navSections] = await Promise.all([
    getSeriesShiurim(slug),
    getSeriesNavSections(slug),
  ]);

  const seriesInfo = {
    slug: series.slug,
    name: series.name,
    description: series.description,
    group: series.group,
    navType: series.navType,
    sortDefault: series.sortDefault ?? "newest",
  };

  return (
    <SeriesPageClient
      series={seriesInfo}
      shiurim={shiurim}
      navSections={navSections}
    />
  );
}
