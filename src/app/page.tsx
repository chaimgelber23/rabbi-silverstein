import { getLandingData } from "@/lib/seriesData";
import { fetchAllShiurim } from "@/lib/shiurim";
import HomeLanding from "@/components/shiurim/HomeLanding";
import SeoContentBlock from "@/components/seo/SeoContentBlock";
import { getSeoContent } from "@/lib/seo/content";

export const revalidate = 3600;

const home = getSeoContent("home");

export const metadata = home
  ? { title: { absolute: home.titleTag }, description: home.metaDescription }
  : {};

export default async function HomePage() {
  const [landingData, allShiurim] = await Promise.all([
    getLandingData(),
    fetchAllShiurim(),
  ]);

  return (
    <>
      <HomeLanding
        ungrouped={landingData.ungrouped}
        groups={landingData.groups}
        totalCount={landingData.totalCount}
        allShiurim={allShiurim}
      />
      {home && <SeoContentBlock content={home} />}
    </>
  );
}
