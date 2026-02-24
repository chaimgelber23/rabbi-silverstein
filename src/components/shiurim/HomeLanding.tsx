"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import type { Shiur, SeriesStats } from "@/lib/types";
import { useAudioPlayer } from "./AudioPlayerProvider";
import SearchBar from "./SearchBar";
import SeriesCard from "./SeriesCard";
import ShiurCard from "./ShiurCard";
import SignInBanner from "../SignInBanner";

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

interface LandingProps {
  ungrouped: SeriesStats[];
  groups: { id: string; label: string; description: string; series: SeriesStats[] }[];
  totalCount: number;
  latestShiurim: Shiur[];
  allShiurim: Shiur[];
}

export default function HomeLanding({ ungrouped, groups, totalCount, latestShiurim, allShiurim }: LandingProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { playShiur, playerState } = useAudioPlayer();

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return allShiurim.filter((s) => s.title.toLowerCase().includes(q));
  }, [searchQuery, allShiurim]);

  const isSearching = searchQuery.trim().length > 0;

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="bg-brown py-24 px-6 text-center">
        <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-4xl mx-auto">
          <motion.div variants={fadeUp} className="mb-6">
            <div className="w-20 h-20 bg-amber/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </motion.div>
          <motion.h1 variants={fadeUp} className="serif-heading text-amber text-5xl md:text-6xl font-bold mb-6">
            Learn Torah with<br />Rabbi Odom Silverstein
          </motion.h1>
          <motion.p variants={fadeUp} className="text-white/80 text-xl font-light mb-4">
            5 Minute Nefesh HaChaim &bull; 5 Minute Tanya &bull; Bitachon &bull; Parsha
          </motion.p>
          <motion.p variants={fadeUp} className="text-white/50 text-sm tracking-widest uppercase">
            {totalCount.toLocaleString()}+ Shiurim Available
          </motion.p>
        </motion.div>
      </section>

      <SignInBanner />

      {/* Search */}
      <section className="bg-tan border-b border-amber/10 py-6 px-6 sticky top-[73px] z-40 backdrop-blur-sm bg-tan/95">
        <div className="max-w-5xl mx-auto">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-6 bg-cream">
        <div className="max-w-6xl mx-auto">
          {isSearching && (
            <div>
              <p className="text-brown/60 text-sm mb-6">
                {searchResults?.length || 0} result{searchResults?.length !== 1 ? "s" : ""} for &ldquo;{searchQuery}&rdquo;
              </p>
              {searchResults && searchResults.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.slice(0, 30).map((shiur) => (
                    <ShiurCard key={shiur.id} shiur={shiur} onPlay={playShiur}
                      isCurrentlyPlaying={playerState.currentShiur?.id === shiur.id && playerState.isPlaying}
                      isCurrent={playerState.currentShiur?.id === shiur.id} />
                  ))}
                </div>
              )}
            </div>
          )}

          {!isSearching && (
            <>
              {/* Grouped series (Nefesh HaChaim) */}
              {groups.map((group) => (
                <motion.div key={group.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mb-16">
                  <motion.div variants={fadeUp} className="flex items-center gap-4 mb-8">
                    <div className="size-12 bg-amber/10 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="serif-heading text-brown text-4xl font-bold">{group.label}</h2>
                      <p className="text-brown/50 text-sm">{group.description}</p>
                    </div>
                  </motion.div>
                  <motion.div variants={fadeUp} className="w-20 h-1 bg-amber mb-10" />
                  <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {group.series.map((s) => <SeriesCard key={s.slug} series={s} />)}
                  </motion.div>
                </motion.div>
              ))}

              {/* Ungrouped */}
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                <motion.div variants={fadeUp} className="flex items-center gap-4 mb-8">
                  <div className="size-12 bg-amber/10 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h2 className="serif-heading text-brown text-4xl font-bold">Browse Shiurim</h2>
                </motion.div>
                <motion.div variants={fadeUp} className="w-20 h-1 bg-amber mb-10" />
                <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ungrouped.map((s) => <SeriesCard key={s.slug} series={s} />)}
                </motion.div>
              </motion.div>

              {/* Latest */}
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mt-16">
                <motion.div variants={fadeUp} className="flex items-center gap-4 mb-8">
                  <div className="size-12 bg-amber/10 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="serif-heading text-brown text-4xl font-bold">Latest Shiurim</h2>
                </motion.div>
                <motion.div variants={fadeUp} className="w-20 h-1 bg-amber mb-10" />
                <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {latestShiurim.map((shiur) => (
                    <motion.div key={shiur.id} variants={fadeUp}>
                      <ShiurCard shiur={shiur} onPlay={playShiur}
                        isCurrentlyPlaying={playerState.currentShiur?.id === shiur.id && playerState.isPlaying}
                        isCurrent={playerState.currentShiur?.id === shiur.id} />
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>

              {/* CTA */}
              <div className="mt-16 bg-brown rounded-2xl py-12 px-6 text-center">
                <h2 className="serif-heading text-amber text-3xl font-bold mb-4">Listen Anywhere</h2>
                <p className="text-white/70 text-lg mb-8">Also available on Spotify, Apple Podcasts, Amazon Music, and more</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <a href="https://listen.jewishpodcasts.fm/rabbiodomsilverstein" target="_blank" rel="noopener noreferrer"
                    className="inline-block bg-amber text-brown font-bold px-8 py-3 rounded-xl hover:bg-amber-light transition-colors">JewishPodcasts.fm</a>
                  <a href="https://open.spotify.com/show/1YHYBjDG0AbKzkOftmrZz1" target="_blank" rel="noopener noreferrer"
                    className="inline-block border-2 border-amber text-amber font-bold px-8 py-3 rounded-xl hover:bg-amber/10 transition-colors">Spotify</a>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
