import type { Shiur } from "./types";
import { doc, setDoc, collection, getDocs } from "firebase/firestore";
import { db, auth } from "./firebase";

export interface ShiurProgress {
  shiurId: string;
  seriesSlug?: string;
  currentTime: number;
  duration: number;
  lastListened: string;
  completed: boolean;
}

export interface SeriesProgress {
  seriesSlug: string;
  lastShiurId: string;
  lastListened: string;
  totalListened: number;
}

const PROGRESS_KEY = "ros-shiurim-progress";
const SERIES_PROGRESS_KEY = "ros-series-progress";

async function syncProgressToFirestore(progress: ShiurProgress): Promise<void> {
  if (typeof window === "undefined" || !auth || !db || !auth.currentUser) return;
  try {
    const docRef = doc(db, "users", auth.currentUser.uid, "progress", progress.shiurId);
    await setDoc(docRef, progress, { merge: true });
  } catch (error) {
    console.error("Failed to sync progress to Firestore:", error);
  }
}

async function syncSeriesProgressToFirestore(seriesProgress: SeriesProgress): Promise<void> {
  if (typeof window === "undefined" || !auth || !db || !auth.currentUser) return;
  try {
    const docRef = doc(db, "users", auth.currentUser.uid, "seriesProgress", seriesProgress.seriesSlug);
    await setDoc(docRef, seriesProgress, { merge: true });
  } catch (error) {
    console.error("Failed to sync series progress to Firestore:", error);
  }
}

export async function loadProgressFromFirestore(): Promise<void> {
  if (typeof window === "undefined" || !auth || !db || !auth.currentUser) return;
  try {
    const progressCol = collection(db, "users", auth.currentUser.uid, "progress");
    const progressSnapshot = await getDocs(progressCol);
    const cloudProgress: Record<string, ShiurProgress> = {};
    progressSnapshot.forEach((d) => {
      cloudProgress[d.id] = d.data() as ShiurProgress;
    });

    const localProgress = getAllProgress();
    const mergedProgress: Record<string, ShiurProgress> = { ...cloudProgress };
    Object.entries(localProgress).forEach(([id, local]) => {
      const cloud = cloudProgress[id];
      if (!cloud || new Date(local.lastListened) > new Date(cloud.lastListened)) {
        mergedProgress[id] = local;
      }
    });
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(mergedProgress));

    const seriesCol = collection(db, "users", auth.currentUser.uid, "seriesProgress");
    const seriesSnapshot = await getDocs(seriesCol);
    const cloudSeriesProgress: Record<string, SeriesProgress> = {};
    seriesSnapshot.forEach((d) => {
      cloudSeriesProgress[d.id] = d.data() as SeriesProgress;
    });

    const localSeriesData = localStorage.getItem(SERIES_PROGRESS_KEY);
    const localSeriesProgress: Record<string, SeriesProgress> = localSeriesData ? JSON.parse(localSeriesData) : {};
    const mergedSeriesProgress: Record<string, SeriesProgress> = { ...cloudSeriesProgress };
    Object.entries(localSeriesProgress).forEach(([slug, local]) => {
      const cloud = cloudSeriesProgress[slug];
      if (!cloud || new Date(local.lastListened) > new Date(cloud.lastListened)) {
        mergedSeriesProgress[slug] = local;
      }
    });
    localStorage.setItem(SERIES_PROGRESS_KEY, JSON.stringify(mergedSeriesProgress));
  } catch (error) {
    console.error("Failed to load progress from Firestore:", error);
  }
}

export function getShiurProgress(shiurId: string): ShiurProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(PROGRESS_KEY);
    if (!data) return null;
    const progress: Record<string, ShiurProgress> = JSON.parse(data);
    return progress[shiurId] || null;
  } catch {
    return null;
  }
}

export function saveShiurProgress(progress: ShiurProgress): void {
  if (typeof window === "undefined") return;
  try {
    const data = localStorage.getItem(PROGRESS_KEY);
    const allProgress: Record<string, ShiurProgress> = data ? JSON.parse(data) : {};
    const updatedProgress = { ...progress, lastListened: new Date().toISOString() };
    allProgress[progress.shiurId] = updatedProgress;
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(allProgress));
    syncProgressToFirestore(updatedProgress);
  } catch (e) {
    console.error("Failed to save shiur progress:", e);
  }
}

export function getSeriesProgress(seriesSlug: string): SeriesProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(SERIES_PROGRESS_KEY);
    if (!data) return null;
    const progress: Record<string, SeriesProgress> = JSON.parse(data);
    return progress[seriesSlug] || null;
  } catch {
    return null;
  }
}

export function saveSeriesProgress(seriesSlug: string, shiurId: string): void {
  if (typeof window === "undefined") return;
  try {
    const data = localStorage.getItem(SERIES_PROGRESS_KEY);
    const allProgress: Record<string, SeriesProgress> = data ? JSON.parse(data) : {};
    const current = allProgress[seriesSlug];
    const updatedProgress = {
      seriesSlug,
      lastShiurId: shiurId,
      lastListened: new Date().toISOString(),
      totalListened: current ? current.totalListened + 1 : 1,
    };
    allProgress[seriesSlug] = updatedProgress;
    localStorage.setItem(SERIES_PROGRESS_KEY, JSON.stringify(allProgress));
    syncSeriesProgressToFirestore(updatedProgress);
  } catch (e) {
    console.error("Failed to save series progress:", e);
  }
}

export function getAllProgress(): Record<string, ShiurProgress> {
  if (typeof window === "undefined") return {};
  try {
    const data = localStorage.getItem(PROGRESS_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function getProgressPercentage(shiurId: string): number {
  const progress = getShiurProgress(shiurId);
  if (!progress || progress.duration === 0) return 0;
  return Math.min(100, Math.round((progress.currentTime / progress.duration) * 100));
}

export function isInProgress(shiurId: string): boolean {
  const progress = getShiurProgress(shiurId);
  if (!progress) return false;
  return progress.currentTime > 10 && !progress.completed;
}

export function getNextShiur(shiurim: Shiur[], currentShiurId: string): Shiur | null {
  const current = shiurim.find((s) => s.id === currentShiurId);
  if (!current) return null;
  // Always advance to the chronologically next (later pubDate) shiur
  const currentDate = new Date(current.pubDate).getTime();
  const later = shiurim
    .filter((s) => new Date(s.pubDate).getTime() > currentDate)
    .sort((a, b) => new Date(a.pubDate).getTime() - new Date(b.pubDate).getTime());
  return later[0] || null;
}

export function getRecommendedShiur(
  seriesSlug: string,
  shiurim: Shiur[]
): {
  shiur: Shiur | null;
  shouldResume: boolean;
  isLatest: boolean;
  lastListenedShiur: Shiur | null;
} {
  if (shiurim.length === 0) {
    return { shiur: null, shouldResume: false, isLatest: false, lastListenedShiur: null };
  }

  const seriesProg = getSeriesProgress(seriesSlug);

  if (seriesProg) {
    const lastShiur = shiurim.find((s) => s.id === seriesProg.lastShiurId);
    if (lastShiur) {
      const shiurProg = getShiurProgress(lastShiur.id);
      if (shiurProg && !shiurProg.completed && shiurProg.currentTime > 10) {
        return { shiur: lastShiur, shouldResume: true, isLatest: false, lastListenedShiur: lastShiur };
      }
      if (shiurProg?.completed) {
        const nextShiur = getNextShiur(shiurim, lastShiur.id);
        if (nextShiur) {
          return { shiur: nextShiur, shouldResume: false, isLatest: false, lastListenedShiur: lastShiur };
        }
      }
      return { shiur: lastShiur, shouldResume: false, isLatest: false, lastListenedShiur: lastShiur };
    }
  }

  const sortedShiurim = [...shiurim].sort(
    (a, b) => new Date(a.pubDate).getTime() - new Date(b.pubDate).getTime()
  );
  return { shiur: sortedShiurim[0], shouldResume: false, isLatest: false, lastListenedShiur: null };
}
