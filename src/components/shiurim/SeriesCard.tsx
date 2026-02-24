"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { SeriesStats } from "@/lib/types";
import { getSeriesProgress } from "@/lib/progress";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function SeriesCard({ series }: { series: SeriesStats }) {
  const [hasProgress, setHasProgress] = useState(false);
  const [listenedCount, setListenedCount] = useState(0);

  useEffect(() => {
    const progress = getSeriesProgress(series.slug);
    if (progress) { setHasProgress(true); setListenedCount(progress.totalListened); }
  }, [series.slug]);

  return (
    <motion.div variants={fadeUp}>
      <Link href={`/shiurim/${series.slug}`} className="block h-full">
        <div className="bg-white border border-amber/15 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-amber/30 transition-all group h-full flex flex-col">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-brown font-bold text-lg group-hover:text-amber transition-colors flex-1">{series.name}</h3>
            {hasProgress && (
              <span className="inline-flex items-center gap-1 bg-amber/10 text-amber text-xs font-semibold rounded-full px-2.5 py-1 shrink-0">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                In Progress
              </span>
            )}
          </div>
          <p className="text-brown/50 text-sm mt-1 line-clamp-2 flex-1">{series.description}</p>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-amber/10">
            <span className="text-amber font-semibold text-sm">
              {hasProgress && listenedCount > 0 ? <>{listenedCount}/{series.episodeCount} listened</> : <>{series.episodeCount} shiur{series.episodeCount !== 1 ? "im" : ""}</>}
            </span>
            <span className="text-brown/40 text-xs">Latest: {formatDate(series.latestDate)}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
