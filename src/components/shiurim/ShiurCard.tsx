"use client";

import { useEffect, useState } from "react";
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
  shiur, onPlay, isCurrentlyPlaying, isCurrent,
}: {
  shiur: Shiur; onPlay: (shiur: Shiur) => void; isCurrentlyPlaying: boolean; isCurrent: boolean;
}) {
  const [progressPercent, setProgressPercent] = useState(0);
  const [inProg, setInProg] = useState(false);

  useEffect(() => {
    setProgressPercent(getProgressPercentage(shiur.id));
    setInProg(isInProgress(shiur.id));
  }, [shiur.id]);

  return (
    <div className={`bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-all ${isCurrent ? "border-amber ring-1 ring-amber/20" : "border-amber/15"}`}>
      <h3 className="text-brown font-bold text-lg leading-snug line-clamp-2 mb-3">{shiur.title}</h3>
      <div className="flex items-center gap-2 text-brown/50 text-sm mb-4">
        <span>{formatDate(shiur.pubDate)}</span>
        <span className="text-brown/20">|</span>
        <span>{formatDuration(shiur.duration)}</span>
      </div>

      {progressPercent > 0 && progressPercent < 100 && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-brown/60 mb-1">
            <span>In Progress</span><span>{progressPercent}%</span>
          </div>
          <div className="h-1.5 bg-brown/10 rounded-full overflow-hidden">
            <div className="h-full bg-amber rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      )}

      {progressPercent >= 100 && (
        <div className="mb-4">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Completed
          </span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button onClick={() => onPlay(shiur)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${isCurrent ? "bg-amber text-white" : "bg-amber/10 text-amber hover:bg-amber/20"}`}>
          {isCurrentlyPlaying ? (
            <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>Pause</>
          ) : (
            <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>{isCurrent ? "Resume" : (inProg ? "Resume" : "Play")}</>
          )}
        </button>
        <a href={shiur.audioUrl} download target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-brown/50 hover:text-amber hover:bg-amber/5 transition-all" title="Download">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download
        </a>
      </div>
    </div>
  );
}
