import type { Metadata } from "next";
import MyLearningClient from "@/components/shiurim/MyLearningClient";

export const metadata: Metadata = {
  title: "My Learning | Rabbi Odom Silverstein",
  description: "Track your Torah learning progress across all of Rabbi Silverstein's shiurim.",
};

export default function MyLearningPage() {
  return <MyLearningClient />;
}
