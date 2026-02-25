"use client";

import { db, storage, auth } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import type { CustomSeriesDef, CustomGroupDef } from "./customData";

// ========== Read operations (client-side, for admin form dropdowns) ==========

export async function getCustomSeriesClient(): Promise<CustomSeriesDef[]> {
  if (!db) return [];
  const snapshot = await getDocs(collection(db, "customSeries"));
  return snapshot.docs.map((d) => d.data() as CustomSeriesDef);
}

export async function getCustomGroupsClient(): Promise<CustomGroupDef[]> {
  if (!db) return [];
  const snapshot = await getDocs(collection(db, "customGroups"));
  return snapshot.docs.map((d) => d.data() as CustomGroupDef);
}

// ========== Write operations ==========

export async function createCustomGroup(group: {
  slug: string;
  label: string;
  description: string;
}): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");
  await setDoc(doc(db, "customGroups", group.slug), {
    ...group,
    createdAt: serverTimestamp(),
  });
}

export async function createCustomSeries(series: {
  slug: string;
  name: string;
  description: string;
  group: string | null;
  navType: string;
  sortDefault: string;
  displayOrder?: number;
}): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");
  await setDoc(doc(db, "customSeries", series.slug), {
    ...series,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

// ========== Audio upload ==========

export async function uploadAudio(
  seriesSlug: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ url: string; storagePath: string }> {
  if (!storage) throw new Error("Firebase Storage not initialized");

  const sanitized = file.name
    .replace(/[^a-zA-Z0-9.-]/g, "-")
    .toLowerCase();
  const storagePath = `shiurim/${seriesSlug}/${Date.now()}-${sanitized}`;
  const storageRef = ref(storage, storagePath);

  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, file, {
      contentType: file.type || "audio/mpeg",
    });

    task.on(
      "state_changed",
      (snapshot) => {
        const percent = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        onProgress?.(percent);
      },
      (error) => reject(error),
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve({ url, storagePath });
      }
    );
  });
}

// ========== Save shiur metadata ==========

export async function saveCustomShiur(shiur: {
  title: string;
  seriesSlug: string;
  audioUrl: string;
  storagePath: string;
  duration: string;
  durationSeconds: number;
  description: string;
  perekNumber?: number | null;
}): Promise<string> {
  if (!db) throw new Error("Firestore not initialized");

  const docRef = await addDoc(collection(db, "customShiurim"), {
    ...shiur,
    pubDate: new Date().toISOString(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

// ========== Revalidation ==========

export async function triggerRevalidation(path?: string): Promise<void> {
  const token = await auth?.currentUser?.getIdToken();
  if (!token) return;

  await fetch("/api/revalidate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ path }),
  });
}

// ========== Utilities ==========

export function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    const url = URL.createObjectURL(file);
    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(audio.duration);
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to read audio duration"));
    };
    audio.src = url;
  });
}

export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
