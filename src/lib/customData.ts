import { unstable_cache } from "next/cache";
import type { Shiur } from "./types";

export interface CustomSeriesDef {
  slug: string;
  name: string;
  description: string;
  group: string | null;
  navType: "sequential" | "perek";
  sortDefault: "newest" | "oldest";
  displayOrder?: number;
}

export interface CustomGroupDef {
  slug: string;
  label: string;
  description: string;
  displayOrder?: number;
}

async function fetchCustomSeriesUncached(): Promise<CustomSeriesDef[]> {
  try {
    const { adminDb } = await import("./firebase-admin");
    const snapshot = await adminDb.collection("customSeries").get();
    return snapshot.docs.map((doc) => doc.data() as CustomSeriesDef);
  } catch (err) {
    console.error("Failed to fetch custom series:", err);
    return [];
  }
}

async function fetchCustomGroupsUncached(): Promise<CustomGroupDef[]> {
  try {
    const { adminDb } = await import("./firebase-admin");
    const snapshot = await adminDb.collection("customGroups").get();
    return snapshot.docs.map((doc) => doc.data() as CustomGroupDef);
  } catch (err) {
    console.error("Failed to fetch custom groups:", err);
    return [];
  }
}

async function fetchCustomShiurimUncached(): Promise<Shiur[]> {
  try {
    const { adminDb } = await import("./firebase-admin");
    const snapshot = await adminDb.collection("customShiurim").get();
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: `custom-${doc.id}`,
        title: data.title,
        audioUrl: data.audioUrl,
        duration: data.duration || "0:00",
        durationSeconds: data.durationSeconds || 0,
        pubDate: data.pubDate || new Date().toISOString(),
        description: data.description || "",
        link: "",
        categoryId: data.seriesSlug,
      } as Shiur;
    });
  } catch (err) {
    console.error("Failed to fetch custom shiurim:", err);
    return [];
  }
}

export const fetchCustomSeries = unstable_cache(
  fetchCustomSeriesUncached,
  ["custom-series"],
  { revalidate: 300 }
);

export const fetchCustomGroups = unstable_cache(
  fetchCustomGroupsUncached,
  ["custom-groups"],
  { revalidate: 300 }
);

export const fetchCustomShiurim = unstable_cache(
  fetchCustomShiurimUncached,
  ["custom-shiurim"],
  { revalidate: 300 }
);
