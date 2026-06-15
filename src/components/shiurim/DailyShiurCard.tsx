"use client";

import { useEffect, useMemo, useState } from "react";
import type { Shiur } from "@/lib/types";
import { useAudioPlayer } from "./AudioPlayerProvider";
import { getAllProgress, getNextShiur } from "@/lib/progress";
import { canonicalSeriesSlug, getSeriesBySlug, getGroupInfo } from "@/lib/seriesConfig";

type Mode = "resume" | "continue" | "start";

function dayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Consecutive calendar days (ending today or yesterday) with at least one listen.
function computeStreak(listenDays: string[]): number {
  if (listenDays.length === 0) return 0;
  const set = new Set(listenDays);
  const ONE_DAY = 86_400_000;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  let cursor = new Date(today);
  if (!set.has(fmt(cursor))) {
    cursor = new Date(today.getTime() - ONE_DAY);
    if (!set.has(fmt(cursor))) return 0;
  }
  let streak = 0;
  while (set.has(fmt(cursor))) {
    streak++;
    cursor = new Date(cursor.getTime() - ONE_DAY);
  }
  return streak;
}

function pickStart(all: Shiur[]): Shiur | null {
  const flagship = all.filter((s) => canonicalSeriesSlug(s) === "nefesh-hachaim-shaar-1");
  const pool = flagship.length ? flagship : all;
  if (pool.length === 0) return null;
  return [...pool].sort((a, b) => new Date(a.pubDate).getTime() - new Date(b.pubDate).getTime())[0];
}

function seriesName(slug: string): string {
  return getSeriesBySlug(slug)?.name ?? getGroupInfo(slug)?.label ?? "";
}

function fmtDuration(d: string): string {
  const p = d.split(":").map(Number);
  if (p.length === 3) return p[0] > 0 ? `${p[0]}h ${p[1]}m` : `${p[1]} min`;
  if (p.length === 2) return `${p[0]} min`;
  return d;
}

export default function DailyShiurCard({ allShiurim }: { allShiurim: Shiur[] }) {
  const { playShiur, playerState } = useAudioPlayer();
  const [mounted, setMounted] = useState(false);
  const [target, setTarget] = useState<{ shiur: Shiur; mode: Mode; seriesSlug: string } | null>(null);
  const [streak, setStreak] = useState(0);

  // Deterministic default (server + first client render agree → no hydration mismatch).
  const defaultStart = useMemo(() => pickStart(allShiurim), [allShiurim]);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setMounted(true);
    const entries = Object.values(getAllProgress());
    setStreak(computeStreak(entries.map((p) => dayKey(p.lastListened)).filter(Boolean)));

    if (entries.length > 0) {
      const last = [...entries].sort(
        (a, b) => new Date(b.lastListened).getTime() - new Date(a.lastListened).getTime()
      )[0];
      const lastShiur = allShiurim.find((s) => s.id === last.shiurId);
      if (lastShiur) {
        const slug = canonicalSeriesSlug(lastShiur);
        if (!last.completed && last.currentTime > 10) {
          setTarget({ shiur: lastShiur, mode: "resume", seriesSlug: slug });
          return;
        }
        const inSeries = allShiurim.filter((s) => canonicalSeriesSlug(s) === slug);
        const next = getNextShiur(inSeries, lastShiur.id);
        setTarget(
          next
            ? { shiur: next, mode: "continue", seriesSlug: slug }
            : { shiur: lastShiur, mode: "resume", seriesSlug: slug }
        );
        return;
      }
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [allShiurim]);

  const display =
    target ??
    (defaultStart
      ? { shiur: defaultStart, mode: "start" as Mode, seriesSlug: canonicalSeriesSlug(defaultStart) }
      : null);

  if (!display) return null;

  const isCurrent = playerState.currentShiur?.id === display.shiur.id;
  const isPlaying = isCurrent && playerState.isPlaying;
  const label =
    display.mode === "resume"
      ? "Pick up where you left off"
      : display.mode === "continue"
        ? "Continue your learning"
        : "Start today's shiur";
  const sName = seriesName(display.seriesSlug);

  const handlePlay = () => {
    const inSeries = allShiurim.filter((s) => canonicalSeriesSlug(s) === display.seriesSlug);
    playShiur(
      display.shiur,
      display.mode === "start",
      display.seriesSlug,
      getNextShiur(inSeries, display.shiur.id),
      inSeries
    );
  };

  return (
    <section className="px-6 pt-8 bg-cream">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg shadow-amber/5 border border-amber/15 p-5 sm:p-6 flex items-center gap-5">
          <button
            onClick={handlePlay}
            aria-label={isPlaying ? "Pause" : display.mode === "resume" ? "Resume shiur" : "Play shiur"}
            className="relative shrink-0 w-16 h-16 rounded-full flex items-center justify-center transition-transform duration-150 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber/60 focus-visible:ring-offset-2"
            style={{
              background: "linear-gradient(145deg, #D4B87A 0%, #C4A265 55%, #A8763C 100%)",
              boxShadow: "0 6px 18px rgba(168,118,60,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
          >
            {isPlaying ? (
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="6" y="4" width="4" height="16" rx="1.5" />
                <rect x="14" y="4" width="4" height="16" rx="1.5" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white translate-x-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-1 flex-wrap">
              <span className="text-amber-text text-xs font-bold uppercase tracking-wider">{label}</span>
              {mounted && streak > 1 && (
                <span className="inline-flex items-center gap-1 bg-amber/10 text-amber-text text-xs font-semibold px-2 py-0.5 rounded-full">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.61a.75.75 0 00-1.152-.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248zM15.75 14.25a3.75 3.75 0 11-7.313-1.172c.628.465 1.35.81 2.133 1.002A5.99 5.99 0 0112 9.75c.097 0 .194.001.29.004a3.751 3.751 0 013.46 4.496z" clipRule="evenodd" />
                  </svg>
                  {streak}-day streak
                </span>
              )}
            </div>
            <h2 className="text-brown font-bold text-lg leading-snug line-clamp-1">{display.shiur.title}</h2>
            <p className="text-brown/60 text-sm mt-0.5">
              {sName ? `${sName} · ` : ""}
              {fmtDuration(display.shiur.duration)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
