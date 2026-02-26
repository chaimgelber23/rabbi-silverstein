"use client";

import { useEffect, useState, useCallback } from "react";
import type { Shiur } from "@/lib/types";
import { getProgressPercentage, isInProgress } from "@/lib/progress";

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDuration(duration: string): string {
  const parts = duration.split(":").map(Number);
  if (parts.length === 3) {
    if (parts[0] > 0) return `${parts[0]}h ${parts[1]}m`;
    return `${parts[1]} min`;
  }
  if (parts.length === 2) return `${parts[0]} min`;
  return duration;
}

export default function ShiurCard({
  shiur, onPlay, onPlayFromBeginning, isCurrentlyPlaying, isCurrent,
}: {
  shiur: Shiur;
  onPlay: (shiur: Shiur) => void;
  onPlayFromBeginning?: (shiur: Shiur) => void;
  isCurrentlyPlaying: boolean;
  isCurrent: boolean;
}) {
  const [progressPercent, setProgressPercent] = useState(0);
  const [inProg, setInProg] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    setProgressPercent(getProgressPercentage(shiur.id));
    setInProg(isInProgress(shiur.id));
  }, [shiur.id]);

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      const res = await fetch(shiur.audioUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const filename = shiur.title.replace(/[^a-zA-Z0-9\s-]/g, "").trim().replace(/\s+/g, "-") + ".mp3";
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(shiur.audioUrl, "_blank");
    } finally {
      setDownloading(false);
    }
  }, [shiur.audioUrl, shiur.title]);

  return (
    <div className={`bg-white rounded-xl transition-all duration-200 border ${
      isCurrent
        ? "border-amber shadow-md shadow-amber/10 ring-1 ring-amber/20"
        : "border-amber/10 shadow-sm hover:shadow-md hover:border-amber/25"
    }`}>
      <div className="flex items-center gap-4 p-4">

        {/* ── Play / Pause button ── */}
        <button
          onClick={() => onPlay(shiur)}
          aria-label={isCurrentlyPlaying ? "Pause" : isCurrent ? "Resume" : "Play"}
          className="relative flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center
                     transition-transform duration-150 hover:scale-105 active:scale-95
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-amber/60 focus-visible:ring-offset-2"
          style={{
            background: "linear-gradient(145deg, #D4B87A 0%, #C4A265 55%, #A8763C 100%)",
            boxShadow: isCurrentlyPlaying
              ? "0 0 0 4px rgba(196,162,101,0.22), 0 6px 18px rgba(168,118,60,0.45)"
              : "0 4px 14px rgba(168,118,60,0.38), inset 0 1px 0 rgba(255,255,255,0.18)",
          }}
        >
          {/* Pulse ring when actively playing */}
          {isCurrentlyPlaying && (
            <span
              className="absolute inset-0 rounded-full animate-ping"
              style={{ background: "rgba(196,162,101,0.35)" }}
            />
          )}

          {isCurrentlyPlaying ? (
            <svg className="w-[17px] h-[17px] text-white drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
              <rect x="5.5" y="4" width="4" height="16" rx="2" />
              <rect x="14.5" y="4" width="4" height="16" rx="2" />
            </svg>
          ) : (
            <svg className="w-[17px] h-[17px] text-white drop-shadow-sm translate-x-px" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* ── Title + meta + progress ── */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold text-sm leading-snug line-clamp-2 mb-0.5 transition-colors ${
            isCurrent ? "text-amber" : "text-brown"
          }`}>
            {shiur.title}
          </h3>
          <div className="flex items-center gap-1.5 text-brown/40 text-xs flex-wrap">
            <span>{formatDate(shiur.pubDate)}</span>
            <span>·</span>
            <span>{formatDuration(shiur.duration)}</span>
            {progressPercent >= 100 && (
              <>
                <span>·</span>
                <span className="text-green-600/80 font-semibold flex items-center gap-0.5">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Done
                </span>
              </>
            )}
          </div>

          {/* Thin progress bar */}
          {progressPercent > 0 && progressPercent < 100 && (
            <div className="mt-2 h-1 bg-brown/8 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%`, background: "linear-gradient(90deg,#C4A265,#D4B87A)" }}
              />
            </div>
          )}
        </div>

        {/* ── Icon actions ── */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {inProg && !isCurrentlyPlaying && onPlayFromBeginning && (
            <button
              onClick={() => onPlayFromBeginning(shiur)}
              title="Start over"
              className="w-8 h-8 rounded-full flex items-center justify-center text-brown/25
                         hover:text-amber hover:bg-amber/8 transition-all duration-150"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
          <button
            onClick={handleDownload}
            disabled={downloading}
            title="Download"
            className="w-8 h-8 rounded-full flex items-center justify-center text-brown/25
                       hover:text-amber hover:bg-amber/8 transition-all duration-150 disabled:opacity-40"
          >
            {downloading ? (
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
