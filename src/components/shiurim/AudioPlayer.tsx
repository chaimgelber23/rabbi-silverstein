"use client";

import { useState, useRef, useCallback, useEffect } from "react";
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
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);

  const getProgressFromEvent = useCallback((clientX: number) => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    return Math.max(0, Math.min(100, (x / rect.width) * 100));
  }, []);

  // Keep refs for drag state so event listeners always see latest value
  const dragProgressRef = useRef(0);
  const isDraggingRef = useRef(false);
  useEffect(() => { dragProgressRef.current = dragProgress; }, [dragProgress]);
  useEffect(() => { isDraggingRef.current = isDragging; }, [isDragging]);

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const pct = getProgressFromEvent(e.clientX);
    setIsDragging(true);
    setDragProgress(pct);
    dragProgressRef.current = pct;

    const handleMouseMove = (ev: MouseEvent) => {
      ev.preventDefault();
      const p = getProgressFromEvent(ev.clientX);
      dragProgressRef.current = p;
      setDragProgress(p);
    };
    const handleMouseUp = (ev: MouseEvent) => {
      const p = getProgressFromEvent(ev.clientX);
      setIsDragging(false);
      setDragProgress(p);
      onSeek((p / 100) * duration);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }, [getProgressFromEvent, duration, onSeek]);

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    e.preventDefault();
    const pct = getProgressFromEvent(touch.clientX);
    setIsDragging(true);
    setDragProgress(pct);
    dragProgressRef.current = pct;
  }, [getProgressFromEvent]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    const touch = e.touches[0];
    if (!touch) return;
    const pct = getProgressFromEvent(touch.clientX);
    dragProgressRef.current = pct;
    setDragProgress(pct);
  }, [getProgressFromEvent]);

  const handleTouchEnd = useCallback(() => {
    if (!isDraggingRef.current) return;
    setIsDragging(false);
    onSeek((dragProgressRef.current / 100) * duration);
  }, [duration, onSeek]);

  const displayProgress = isDragging ? dragProgress : progress;
  const displayTime = isDragging ? (dragProgress / 100) * duration : currentTime;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-brown border-t border-amber/20 shadow-2xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          {/* Title row */}
          <div className="flex items-center justify-between mb-2">
            <p className="text-white text-sm font-semibold truncate flex-1 min-w-0 mr-3">{shiur.title}</p>
            <button onClick={onClose} className="shrink-0 text-white/40 hover:text-white/70 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Seekbar */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-white/60 text-xs tabular-nums w-12 text-right shrink-0">{formatTime(displayTime)}</span>
            <div
              ref={trackRef}
              className="flex-1 relative h-6 flex items-center cursor-pointer group"
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              role="slider"
              aria-label="Seek"
              aria-valuemin={0}
              aria-valuemax={duration}
              aria-valuenow={displayTime}
              tabIndex={0}
            >
              <div className="absolute inset-x-0 h-1.5 bg-white/15 rounded-full" />
              <div
                className={`absolute left-0 h-1.5 bg-amber rounded-full ${isDragging ? '' : 'transition-[width] duration-150'}`}
                style={{ width: `${displayProgress}%` }}
              />
              <div
                className={`absolute h-4 w-4 bg-amber rounded-full shadow-md shadow-amber/30 -translate-x-1/2 hover:scale-125 active:scale-125 ${isDragging ? '' : 'transition-[left] duration-150'}`}
                style={{ left: `${displayProgress}%` }}
              >
                <div className={`absolute inset-0 rounded-full bg-amber/30 transition-transform ${isDragging ? "scale-[2]" : "scale-0 group-hover:scale-[1.8]"}`} />
              </div>
            </div>
            <span className="text-white/60 text-xs tabular-nums w-12 shrink-0">
              {duration > 0 ? `-${formatTime(duration - displayTime)}` : "0:00"}
            </span>
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-center gap-5">
            <button onClick={onSkipBack} className="shrink-0 w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-colors rounded-full hover:bg-white/10" title="Back 10s">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                <path d="M12.5 8V4L6 9l6.5 5v-4c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H5c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" fill="currentColor" transform="scale(-1,1) translate(-24,0)" />
                <text x="12" y="15.5" textAnchor="middle" fill="currentColor" fontSize="7" fontWeight="700" fontFamily="system-ui, sans-serif">10</text>
              </svg>
            </button>

            <button onClick={onTogglePlay} className="shrink-0 w-14 h-14 bg-amber hover:bg-amber/90 rounded-full flex items-center justify-center text-brown transition-all shadow-lg shadow-amber/25 hover:shadow-amber/40 hover:scale-105 active:scale-95">
              {isPlaying ? (
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
              ) : (
                <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              )}
            </button>

            <button onClick={onSkipForward} className="shrink-0 w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-colors rounded-full hover:bg-white/10" title="Forward 10s">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                <path d="M12.5 8V4L6 9l6.5 5v-4c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H5c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" fill="currentColor" />
                <text x="12" y="15.5" textAnchor="middle" fill="currentColor" fontSize="7" fontWeight="700" fontFamily="system-ui, sans-serif">10</text>
              </svg>
            </button>

            <div className="hidden sm:flex items-center gap-1 ml-4">
              {RATES.map((rate) => (
                <button key={rate} onClick={() => onSetRate(rate)}
                  className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${playbackRate === rate ? "bg-amber text-brown" : "text-white/50 hover:text-white/80"}`}>
                  {rate}x
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                const currentIndex = RATES.indexOf(playbackRate);
                const nextIndex = (currentIndex + 1) % RATES.length;
                onSetRate(RATES[nextIndex] || 1);
              }}
              className="sm:hidden shrink-0 px-2.5 py-1 rounded-lg bg-white/10 text-white/90 text-xs font-medium hover:bg-white/20 transition-colors ml-2"
            >
              {playbackRate}x
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
