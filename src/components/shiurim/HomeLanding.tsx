"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { Shiur, SeriesStats } from "@/lib/types";
import { useAudioPlayer } from "./AudioPlayerProvider";
import { getNextShiur } from "@/lib/progress";
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
  allShiurim: Shiur[];
}

export default function HomeLanding({ ungrouped, groups, totalCount, allShiurim }: LandingProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("");
  const tabsRef = useRef<HTMLDivElement>(null);
  const { playShiur, playerState } = useAudioPlayer();

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return allShiurim.filter((s) => s.title.toLowerCase().includes(q));
  }, [searchQuery, allShiurim]);

  const isSearching = searchQuery.trim().length > 0;

  // Build tab items: All Shiurim first, then group scroll-targets, then remaining ungrouped series
  const tabs = useMemo(() => {
    const items: { id: string; label: string; href?: string }[] = [];
    // "All Shiurim" always goes first as a direct link
    const allShiurimEntry = ungrouped.find((s) => s.slug === "other");
    if (allShiurimEntry) {
      items.push({ id: allShiurimEntry.slug, label: allShiurimEntry.name, href: `/shiurim/${allShiurimEntry.slug}` });
    }
    // Then group scroll-targets (Nefesh HaChaim, Tanya, etc.)
    groups.forEach((g) => items.push({ id: `section-${g.id}`, label: g.label }));
    // Then remaining ungrouped series (Parsha, Holidays, etc.) – except "other" already added
    ungrouped
      .filter((s) => s.slug !== "other")
      .forEach((s) => items.push({ id: s.slug, label: s.name, href: `/shiurim/${s.slug}` }));
    return items;
  }, [groups, ungrouped]);

  // Scroll-target sections (only the ones that exist on the page)
  const scrollTabs = useMemo(() => tabs.filter((t) => !t.href), [tabs]);

  // Track which section is in view
  useEffect(() => {
    const ids = scrollTabs.map((t) => t.id);
    if (ids.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-40% 0px -50% 0px" }
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [scrollTabs]);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 160; // sticky header + search bar height
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }, []);

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

      {/* Search + Section Tabs */}
      <section className="bg-tan border-b border-amber/10 py-4 px-6 sticky top-[73px] z-40 backdrop-blur-sm bg-tan/95">
        <div className="max-w-5xl mx-auto space-y-3">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          {!isSearching && tabs.length > 0 && (
            <div ref={tabsRef} className="flex items-center gap-2 overflow-x-auto scrollbar-thin pb-0.5 -mb-1">
              {tabs.map((tab) =>
                tab.href ? (
                  <Link
                    key={tab.id}
                    href={tab.href}
                    className="whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium text-brown/50 hover:text-brown hover:bg-brown/5 transition-all"
                  >
                    {tab.label}
                  </Link>
                ) : (
                  <button
                    key={tab.id}
                    onClick={() => scrollToSection(tab.id)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${activeSection === tab.id
                      ? "bg-brown text-amber"
                      : "text-brown/50 hover:text-brown hover:bg-brown/5"
                      }`}
                  >
                    {tab.label}
                  </button>
                )
              )}
            </div>
          )}
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
                    <ShiurCard key={shiur.id} shiur={shiur}
                      onPlay={(s) => playShiur(s, false, s.categoryId, getNextShiur(searchResults, s.id), searchResults)}
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
                <motion.div key={group.id} id={`section-${group.id}`} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mb-16">
                  <motion.div variants={fadeUp} className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="size-12 bg-amber/10 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="serif-heading text-brown text-4xl font-bold">{group.label}</h2>
                        <p className="text-brown/50 text-sm">{group.description}</p>
                      </div>
                    </div>
                    <Link href={`/shiurim/${group.id}`} className="text-amber font-semibold text-sm hover:text-amber-light transition-colors flex items-center gap-1 shrink-0">
                      View All
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </Link>
                  </motion.div>
                  <motion.div variants={fadeUp} className="w-20 h-1 bg-amber mb-10" />
                  <motion.div variants={stagger} className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin -mx-1 px-1">
                    {group.series.map((s) => (
                      <div key={s.slug} className="min-w-[260px] max-w-[320px] flex-shrink-0">
                        <SeriesCard series={s} />
                      </div>
                    ))}
                  </motion.div>
                </motion.div>
              ))}

              {/* Ungrouped standalone series with headers (Parsha, Holidays) */}
              {ungrouped.filter(s => s.slug !== "other").map((s) => (
                <motion.div key={s.slug} id={`section-${s.slug}`} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mb-16">
                  <motion.div variants={fadeUp} className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="size-12 bg-amber/10 rounded-xl flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6 text-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="serif-heading text-brown text-4xl font-bold">{s.name}</h2>
                        <p className="text-brown/50 text-sm mt-1">{s.description}</p>
                      </div>
                    </div>
                    <Link href={`/shiurim/${s.slug}`} className="text-amber font-semibold text-sm hover:text-amber-light transition-colors flex items-center gap-1 shrink-0 px-2">
                      View All
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </Link>
                  </motion.div>
                  <motion.div variants={fadeUp} className="w-20 h-1 bg-amber mb-10" />
                  <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <SeriesCard series={s} />
                  </motion.div>
                </motion.div>
              ))}

              {/* Remaining ungrouped (Other) */}
              {ungrouped.filter(s => s.slug === "other").length > 0 && (
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                  <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ungrouped.filter(s => s.slug === "other").map((s) => <SeriesCard key={s.slug} series={s} />)}
                  </motion.div>
                </motion.div>
              )}

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
