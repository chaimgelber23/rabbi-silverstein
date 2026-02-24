import type { Metadata } from "next";
import ProfileClient from "@/components/ProfileClient";

export const metadata: Metadata = {
  title: "My Account | Rabbi Odom Silverstein",
  description: "Manage your account settings.",
};

export default function ProfilePage() {
  return <ProfileClient />;
}
