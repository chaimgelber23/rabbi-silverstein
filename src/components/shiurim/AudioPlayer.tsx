"use client";

import type { Shiur } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

const RATES = [1, 1.25, 1.5, 2];

function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function AudioPlayer({
  shiur, isPlaying, currentTime, duration, playbackRate,
  onTogglePlay, onSeek, onSkipBack, onSkipForward, onSetRate, onClose,
}: {
  shiur: Shiur; isPlaying: boolean; currentTime: number; duration: number; playbackRate: number;
  onTogglePlay: () => void; onSeek: (time: number) => void; onSkipBack: () => void; onSkipForward: () => void; onSetRate: (rate: number) => void; onClose: () => void;
}) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    onSeek((x / rect.width) * duration);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-brown border-t border-amber/20 shadow-2xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="h-1 bg-white/10 rounded-full cursor-pointer mb-3 group" onClick={handleProgressClick}>
            <div className="h-full bg-amber rounded-full transition-all duration-150 relative" style={{ width: `${progress}%` }}>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-amber rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onSkipBack} className="relative shrink-0 w-8 h-8 flex items-center justify-center text-white/50 hover:text-amber transition-colors" title="Back 10s">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 16.5V9.5m4 7V9.5m0 0v-1a2 2 0 00-2-2m2 3v-1a2 2 0 011-1.732M3 13c0-4.97 4.03-9 9-9a9 9 0 019 9c0 4.97-4.03 9-9 9-2.062 0-3.96-.696-5.46-1.855M3 13H1m2 0l-2-2m2 2l-2 2" />
              </svg>
              <span className="absolute text-[8px] font-bold mt-0.5">10</span>
            </button>
            <button onClick={onTogglePlay} className="shrink-0 w-10 h-10 bg-amber/20 hover:bg-amber/30 rounded-full flex items-center justify-center text-amber transition-colors">
              {isPlaying ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
              ) : (
                <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              )}
            </button>
            <button onClick={onSkipForward} className="relative shrink-0 w-8 h-8 flex items-center justify-center text-white/50 hover:text-amber transition-colors" title="Forward 10s">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 16.5V9.5m4 7V9.5m0 0v-1a2 2 0 012-2m-2 3v-1a2 2 0 00-1-1.732M21 13c0-4.97-4.03-9-9-9a9 9 0 00-9 9c0 4.97 4.03 9 9 9 2.062 0 3.96-.696 5.46-1.855M21 13h2m-2 0l2-2m-2 2l2 2" />
              </svg>
              <span className="absolute text-[8px] font-bold mt-0.5">10</span>
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{shiur.title}</p>
              <p className="text-white/50 text-xs">{formatTime(currentTime)} / {formatTime(duration)}</p>
            </div>
            <div className="hidden sm:flex items-center gap-1">
              {RATES.map((rate) => (
                <button key={rate} onClick={() => onSetRate(rate)}
                  className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${playbackRate === rate ? "bg-amber text-brown" : "text-white/50 hover:text-white/80"}`}>
                  {rate}x
                </button>
              ))}
            </div>
            {/* Speed control (Mobile) */}
            <button
              onClick={() => {
                const currentIndex = RATES.indexOf(playbackRate);
                const nextIndex = (currentIndex + 1) % RATES.length;
                onSetRate(RATES[nextIndex] || 1);
              }}
              className="sm:hidden shrink-0 px-2 py-1 rounded bg-white/10 text-white/90 text-xs font-medium hover:bg-white/20 transition-colors"
            >
              {playbackRate}x
            </button>
            <button onClick={onClose} className="shrink-0 text-white/40 hover:text-white/70 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
