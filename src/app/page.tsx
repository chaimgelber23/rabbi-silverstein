import { getLandingData } from "@/lib/seriesData";
import { fetchAllShiurim } from "@/lib/shiurim";
import HomeLanding from "@/components/shiurim/HomeLanding";

export const revalidate = 3600;

export default async function HomePage() {
  const [landingData, allShiurim] = await Promise.all([
    getLandingData(),
    fetchAllShiurim(),
  ]);

  return (
    <HomeLanding
      ungrouped={landingData.ungrouped}
      groups={landingData.groups}
      totalCount={landingData.totalCount}
      allShiurim={allShiurim}
    />
  );
}
