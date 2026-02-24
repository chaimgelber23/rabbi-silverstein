"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import type { Shiur, SortOrder, NavType, SeriesGroup } from "@/lib/types";
import { useAudioPlayer } from "./AudioPlayerProvider";
import { getRecommendedShiur, getNextShiur } from "@/lib/progress";
import SeriesHero from "./SeriesHero";
import ShiurCard from "./ShiurCard";
import SignInBanner from "../SignInBanner";

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { visible: { transition: { staggerChildren: 0.06 } } };
const PAGE_SIZE = 30;

interface SeriesInfo {
  slug: string; name: string; description: string; group: SeriesGroup; navType: NavType; sortDefault: SortOrder;
}

export default function SeriesPageClient({ series, shiurim, navSections }: {
  series: SeriesInfo; shiurim: Shiur[]; navSections: string[];
}) {
  const [sortOrder, setSortOrder] = useState<SortOrder>(series.sortDefault);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const { playShiur, playerState } = useAudioPlayer();

  const recommendedShiur = useMemo(() => getRecommendedShiur(series.slug, shiurim), [series.slug, shiurim]);

  const filteredShiurim = useMemo(() => {
    let filtered = [...shiurim];
    if (selectedSection && series.navType === "perek") {
      const perekNum = selectedSection.replace(/\D/g, "");
      filtered = filtered.filter((s) => new RegExp(`(?:perek\\s*${perekNum}\\b|\\b${perekNum}\\.\\d|\\b${perekNum}[,:\\s])`, "i").test(s.title));
    } else if (selectedSection && series.navType === "topic") {
      const lower = selectedSection.toLowerCase();
      filtered = filtered.filter((s) => s.title.toLowerCase().includes(lower));
    }
    filtered.sort((a, b) => {
      const diff = new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
      return sortOrder === "newest" ? diff : -diff;
    });
    return filtered;
  }, [shiurim, selectedSection, sortOrder, series.navType]);

  const visible = filteredShiurim.slice(0, visibleCount);
  const hasMore = visibleCount < filteredShiurim.length;
  const handleSectionChange = (section: string | null) => { setSelectedSection(section); setVisibleCount(PAGE_SIZE); };

  return (
    <main className="min-h-screen">
      <SeriesHero name={series.name} description={series.description} group={series.group} episodeCount={shiurim.length} />
      <SignInBanner />

      <section className="py-12 px-6 bg-cream">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center gap-3 mb-8">
            {recommendedShiur.lastListenedShiur && (
              <button onClick={() => {
                const s = recommendedShiur.shouldResume ? recommendedShiur.shiur : (recommendedShiur.shiur || recommendedShiur.lastListenedShiur);
                if (!s) return;
                playShiur(s, false, series.slug, getNextShiur(shiurim, s.id));
              }} className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-amber text-white shadow-md hover:bg-amber-light transition-all flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                {recommendedShiur.shouldResume ? "Resume" : "Continue"} in {series.name}
              </button>
            )}
            <button onClick={() => { setSortOrder("oldest"); handleSectionChange(null); }}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${sortOrder === "oldest" && !selectedSection ? "bg-brown text-white shadow-md" : "bg-white border border-brown/15 text-brown/70 hover:border-brown/30"}`}>
              Start from Beginning
            </button>
            <button onClick={() => { setSortOrder("newest"); handleSectionChange(null); }}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${sortOrder === "newest" && !selectedSection ? "bg-brown text-white shadow-md" : "bg-white border border-brown/15 text-brown/70 hover:border-brown/30"}`}>
              Latest Shiur
            </button>
          </div>

          {series.navType === "perek" && navSections.length > 0 && (
            <div className="mb-8">
              <h3 className="text-brown/60 text-sm font-semibold mb-3 uppercase tracking-wider">Browse by Perek</h3>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => handleSectionChange(null)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${!selectedSection ? "bg-amber text-white" : "bg-white border border-amber/20 text-brown/60 hover:border-amber/40"}`}>
                  All
                </button>
                {navSections.map((section) => (
                  <button key={section} onClick={() => handleSectionChange(section)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedSection === section ? "bg-amber text-white" : "bg-white border border-amber/20 text-brown/60 hover:border-amber/40"}`}>
                    {section}
                  </button>
                ))}
              </div>
            </div>
          )}

          {series.navType === "topic" && navSections.length > 0 && (
            <div className="mb-8">
              <h3 className="text-brown/60 text-sm font-semibold mb-3 uppercase tracking-wider">Browse by Topic</h3>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => handleSectionChange(null)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${!selectedSection ? "bg-amber text-white" : "bg-white border border-amber/20 text-brown/60 hover:border-amber/40"}`}>
                  All
                </button>
                {navSections.map((section) => (
                  <button key={section} onClick={() => handleSectionChange(section)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedSection === section ? "bg-amber text-white" : "bg-white border border-amber/20 text-brown/60 hover:border-amber/40"}`}>
                    {section}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <p className="text-brown/60 text-sm">{filteredShiurim.length} shiur{filteredShiurim.length !== 1 ? "im" : ""}{selectedSection && ` in ${selectedSection}`}</p>
            <div className="flex items-center gap-2">
              <span className="text-brown/50 text-sm">Sort:</span>
              <button onClick={() => setSortOrder("newest")}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${sortOrder === "newest" ? "bg-brown text-white" : "bg-white border border-brown/15 text-brown/60 hover:border-brown/30"}`}>Newest</button>
              <button onClick={() => setSortOrder("oldest")}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${sortOrder === "oldest" ? "bg-brown text-white" : "bg-white border border-brown/15 text-brown/60 hover:border-brown/30"}`}>Oldest</button>
            </div>
          </div>

          <motion.div initial="hidden" animate="visible" variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visible.map((shiur) => (
              <motion.div key={shiur.id} variants={fadeUp}>
                <ShiurCard shiur={shiur} onPlay={(s) => playShiur(s, false, series.slug, getNextShiur(filteredShiurim, s.id))}
                  isCurrentlyPlaying={playerState.currentShiur?.id === shiur.id && playerState.isPlaying}
                  isCurrent={playerState.currentShiur?.id === shiur.id} />
              </motion.div>
            ))}
          </motion.div>

          {filteredShiurim.length === 0 && (
            <div className="text-center py-16 text-brown/40">
              <p className="text-lg">No shiurim found for this selection.</p>
              <button onClick={() => handleSectionChange(null)} className="mt-4 text-amber font-semibold hover:text-amber-light transition-colors">View all shiurim</button>
            </div>
          )}

          {hasMore && (
            <div className="text-center mt-10">
              <button onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="border border-amber/30 text-brown px-8 py-3 rounded-xl font-semibold hover:bg-amber/5 transition-colors">
                Load More <span className="text-brown/50 text-sm ml-2">(showing {visible.length} of {filteredShiurim.length})</span>
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
