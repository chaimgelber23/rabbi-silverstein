import type { Metadata } from "next";
import MyLearningClient from "@/components/shiurim/MyLearningClient";
import { getLandingData } from "@/lib/seriesData";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "My Learning | Rabbi Odom Silverstein",
  description: "Track your Torah learning progress across all of Rabbi Silverstein's shiurim.",
};

export default async function MyLearningPage() {
  const data = await getLandingData();
  const allSeries = [
    ...data.groups.flatMap((g) => g.series),
    ...data.ungrouped,
  ].map((s) => ({ slug: s.slug, name: s.name, episodeCount: s.episodeCount }));

  return <MyLearningClient allSeries={allSeries} />;
}
