"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { SeriesGroup } from "@/lib/types";
import { SERIES_GROUPS } from "@/lib/seriesConfig";

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const stagger = { visible: { transition: { staggerChildren: 0.15 } } };

export default function SeriesHero({ name, description, group, episodeCount }: {
  name: string; description: string; group: SeriesGroup; episodeCount: number;
}) {
  const groupMeta = group ? (SERIES_GROUPS as Record<string, { label: string; description: string }>)[group] : null;

  return (
    <section className="bg-brown py-20 px-6">
      <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-4xl mx-auto text-center">
        <motion.nav variants={fadeUp} className="text-sm text-white/40 mb-6">
          <Link href="/" className="hover:text-amber transition-colors">Shiurim</Link>
          {groupMeta && (<><span className="mx-2">/</span><span className="text-white/60">{groupMeta.label}</span></>)}
          <span className="mx-2">/</span>
          <span className="text-white/80">{name}</span>
        </motion.nav>
        <motion.h1 variants={fadeUp} className="serif-heading text-amber text-4xl md:text-5xl font-bold mb-4">{name}</motion.h1>
        <motion.p variants={fadeUp} className="text-white/70 text-lg mb-4">{description}</motion.p>
        <motion.p variants={fadeUp} className="text-white/50 text-sm tracking-widest uppercase">{episodeCount} Shiurim</motion.p>
      </motion.div>
    </section>
  );
}
