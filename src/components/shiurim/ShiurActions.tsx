"use client";

import { useState } from "react";
import type { Shiur } from "@/lib/types";
import { useAudioPlayer } from "./AudioPlayerProvider";
import { getNextShiur } from "@/lib/progress";

export default function ShiurActions({
  shiur,
  seriesSlug,
  seriesShiurim,
}: {
  shiur: Shiur;
  seriesSlug: string;
  seriesShiurim: Shiur[];
}) {
  const { playShiur, playerState } = useAudioPlayer();
  const [copied, setCopied] = useState(false);

  const isCurrent = playerState.currentShiur?.id === shiur.id;
  const isPlaying = isCurrent && playerState.isPlaying;

  const handlePlay = () => {
    playShiur(shiur, false, seriesSlug, getNextShiur(seriesShiurim, shiur.id), seriesShiurim);
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: shiur.title, text: `${shiur.title} — Rabbi Odom Silverstein`, url });
      } catch {
        // user cancelled the share sheet
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={handlePlay}
        aria-label={isPlaying ? "Pause" : "Play this shiur"}
        className="flex items-center gap-2.5 bg-amber text-brown font-bold px-6 py-3 rounded-xl shadow-md hover:bg-amber-light transition-colors"
      >
        {isPlaying ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
        {isPlaying ? "Pause" : isCurrent ? "Resume" : "Play Shiur"}
      </button>

      <button
        onClick={handleShare}
        aria-label="Share this shiur"
        className="flex items-center gap-2 border border-brown/15 text-brown/70 font-semibold px-4 py-3 rounded-xl hover:border-brown/30 hover:text-brown transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        {copied ? "Copied!" : "Share"}
      </button>
    </div>
  );
}
