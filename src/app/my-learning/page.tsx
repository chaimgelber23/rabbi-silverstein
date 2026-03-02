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
    ...data.groups.flatMap((g) =>
      g.series.map((s) => ({ slug: s.slug, name: s.name, episodeCount: s.episodeCount, group: g.id }))
    ),
    ...data.ungrouped.map((s) => ({ slug: s.slug, name: s.name, episodeCount: s.episodeCount, group: null as string | null })),
  ];

  const groups = data.groups.map((g) => ({ id: g.id, label: g.label }));

  return <MyLearningClient allSeries={allSeries} groups={groups} />;
}
