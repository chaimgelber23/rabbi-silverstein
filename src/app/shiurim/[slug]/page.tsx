import { notFound } from "next/navigation";
import { getSeriesShiurim, getSeriesNavSections, getGroupShiurim } from "@/lib/seriesData";
import { getAllSlugs } from "@/lib/seriesConfig";
import {
  getSeriesBySlugWithCustom,
  getGroupInfoWithCustom,
} from "@/lib/seriesConfigServer";
import SeriesPageClient from "@/components/shiurim/SeriesPageClient";
import { SeriesJsonLd } from "@/components/seo/SeriesJsonLd";
import SeoContentBlock from "@/components/seo/SeoContentBlock";
import { getSeoContent } from "@/lib/seo/content";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export async function generateStaticParams() {
  // Only pre-render hardcoded slugs at build time
  // Custom slugs render on-demand via ISR (dynamicParams = true by default)
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const url = `${SITE_URL}/shiurim/${slug}`;
  const seo = getSeoContent(slug);

  const series = await getSeriesBySlugWithCustom(slug);
  if (series) {
    const description = seo?.metaDescription || series.description || `Torah shiurim on ${series.name} by Rabbi Odom Silverstein.`;
    const ogTitle = seo?.titleTag || `${series.name} | Rabbi Odom Silverstein`;
    return {
      title: seo ? { absolute: seo.titleTag } : series.name,
      description,
      alternates: { canonical: `/shiurim/${slug}` },
      openGraph: { title: ogTitle, description, url, type: "website" },
      twitter: { card: "summary" as const, title: ogTitle, description },
    };
  }

  const group = await getGroupInfoWithCustom(slug);
  if (group) {
    const description = seo?.metaDescription || group.description || `${group.label} shiurim by Rabbi Odom Silverstein.`;
    const ogTitle = seo?.titleTag || `${group.label} | Rabbi Odom Silverstein`;
    return {
      title: seo ? { absolute: seo.titleTag } : group.label,
      description,
      alternates: { canonical: `/shiurim/${slug}` },
      openGraph: { title: ogTitle, description, url, type: "website" },
      twitter: { card: "summary" as const, title: ogTitle, description },
    };
  }

  return {};
}

export default async function SeriesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const seo = getSeoContent(slug);

  // Check if it's a group slug (e.g., "nefesh-hachaim", "tanya", "bitachon")
  const group = await getGroupInfoWithCustom(slug);
  if (group) {
    const shiurim = await getGroupShiurim(slug);
    return (
      <>
        <SeriesJsonLd slug={slug} name={group.label} description={group.description} shiurim={shiurim} />
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
        {seo && <SeoContentBlock content={seo} />}
      </>
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
    <>
      <SeriesJsonLd slug={slug} name={series.name} description={series.description} shiurim={shiurim} />
      <SeriesPageClient
        series={seriesInfo}
        shiurim={shiurim}
        navSections={navSections}
      />
      {seo && <SeoContentBlock content={seo} />}
    </>
  );
}
