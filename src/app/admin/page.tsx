import AdminClient from "@/components/admin/AdminClient";
import SummaryEditor from "@/components/admin/SummaryEditor";
import { fetchAllShiurim } from "@/lib/shiurim";

export const metadata = {
  title: "Upload Shiurim | Admin",
  robots: "noindex, nofollow",
};

export const revalidate = 300;

export default async function AdminPage() {
  const all = await fetchAllShiurim();
  const slim = all.map((s) => ({ id: s.id, title: s.title }));
  return (
    <>
      <AdminClient />
      <SummaryEditor shiurim={slim} />
    </>
  );
}
