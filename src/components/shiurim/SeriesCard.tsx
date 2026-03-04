"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { SeriesStats } from "@/lib/types";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function SeriesCard({ series }: { series: SeriesStats }) {
  return (
    <motion.div variants={fadeUp}>
      <Link href={`/shiurim/${series.slug}`} className="block h-full">
        <div className="bg-white border border-amber/15 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-amber/30 transition-all group h-full flex flex-col">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-brown font-bold text-lg group-hover:text-amber transition-colors flex-1">{series.name}</h3>
          </div>
          <p className="text-brown/50 text-sm mt-1 line-clamp-2 flex-1">{series.description}</p>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-amber/10">
            <span className="text-amber font-semibold text-sm">
              {series.episodeCount} shiur{series.episodeCount !== 1 ? "im" : ""}
            </span>
            <span className="text-brown/50 text-xs font-medium flex items-center gap-1 group-hover:text-amber transition-colors">
              View All
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
