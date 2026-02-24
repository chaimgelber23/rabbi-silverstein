"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import AuthModal from "@/components/AuthModal";
import { getAllProgress, getSeriesProgress, getProgressPercentage, type ShiurProgress } from "@/lib/progress";

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

interface SeriesWithProgress {
  seriesSlug: string; seriesName: string; lastListened: string;
  totalListened: number; lastShiurId: string; progressPercent: number;
}

function formatSeriesName(slug: string): string {
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function formatRelativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min${mins !== 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  if (days < 7) return `${days} day${days !== 1 ? "s" : ""} ago`;
  return new Date(isoDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function MyLearningClient() {
  const { user, loading: authLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [inProgressSeries, setInProgressSeries] = useState<SeriesWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const all = getAllProgress();
    const inProgress = Object.values(all).filter((p) => !p.completed && p.currentTime > 10);

    const seriesMap = new Map<string, SeriesWithProgress>();
    inProgress.forEach((p) => {
      if (!p.seriesSlug) return;
      const existing = seriesMap.get(p.seriesSlug);
      if (!existing || new Date(p.lastListened) > new Date(existing.lastListened)) {
        seriesMap.set(p.seriesSlug, {
          seriesSlug: p.seriesSlug, seriesName: formatSeriesName(p.seriesSlug),
          lastListened: p.lastListened, totalListened: 1, lastShiurId: p.shiurId,
          progressPercent: getProgressPercentage(p.shiurId),
        });
      }
    });

    Array.from(seriesMap.keys()).forEach((slug) => {
      const sp = getSeriesProgress(slug);
      if (sp) { const c = seriesMap.get(slug)!; seriesMap.set(slug, { ...c, totalListened: sp.totalListened }); }
    });

    setInProgressSeries(Array.from(seriesMap.values()).sort((a, b) => new Date(b.lastListened).getTime() - new Date(a.lastListened).getTime()));
    setLoading(false);
  }, []);

  if (authLoading) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber border-t-transparent" />
          <p className="text-brown/60 mt-4">Loading...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-cream py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-brown mb-4">My Learning</h1>
            <p className="text-brown/60 text-lg mb-8">Sign in to keep your place and track your shiurim across all devices</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: "M5 13l4 4L19 7", title: "Keep Your Place", desc: "Pick up exactly where you left off in every shiur" },
              { icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", title: "Track Progress", desc: "See how many shiurim you've completed in each series" },
              { icon: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z", title: "Sync Across Devices", desc: "Start on your phone, continue on your computer" },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-white rounded-xl p-6 shadow-sm border border-amber/15">
                <div className="w-12 h-12 bg-amber/10 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                  </svg>
                </div>
                <h3 className="text-brown font-bold text-lg mb-2">{title}</h3>
                <p className="text-brown/60 text-sm">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <button onClick={() => setShowAuthModal(true)}
              className="inline-flex items-center gap-3 bg-amber text-white px-8 py-3 rounded-xl font-semibold hover:bg-amber-light transition-colors shadow-lg">
              Sign In
            </button>
            <p className="text-brown/40 text-sm mt-4">Your progress is saved locally and synced when you sign in</p>
          </div>
        </div>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream">
      <section className="bg-gradient-to-br from-brown to-brown-light text-white py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome back{user.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}</h1>
          <p className="text-white/80 text-lg">Continue your Torah learning journey</p>
        </div>
      </section>
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber border-t-transparent" />
            </div>
          ) : inProgressSeries.length === 0 ? (
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold text-brown mb-2">Start Your Learning Journey</h2>
              <p className="text-brown/60 mb-6">You haven&apos;t started any shiurim yet.</p>
              <Link href="/" className="inline-block bg-amber text-white px-8 py-3 rounded-xl font-semibold hover:bg-amber-light transition-colors">Browse Shiurim</Link>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold text-brown mb-6">Continue Learning</h2>
              <motion.div initial="hidden" animate="visible" variants={stagger} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {inProgressSeries.map((s) => (
                  <motion.div key={s.seriesSlug} variants={fadeUp}>
                    <Link href={`/shiurim/${s.seriesSlug}`}
                      className="block bg-white border border-amber/15 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-amber/30 transition-all group">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <h3 className="text-brown font-bold text-xl group-hover:text-amber transition-colors mb-1">{s.seriesName}</h3>
                          <p className="text-brown/50 text-sm">{s.totalListened} shiur{s.totalListened !== 1 ? "im" : ""} listened</p>
                        </div>
                        <span className="inline-flex items-center gap-1 bg-amber/10 text-amber text-xs font-semibold rounded-full px-3 py-1.5 shrink-0">Resume</span>
                      </div>
                      {s.progressPercent > 0 && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs text-brown/60 mb-1.5">
                            <span>Last shiur progress</span><span>{s.progressPercent}%</span>
                          </div>
                          <div className="h-2 bg-brown/10 rounded-full overflow-hidden">
                            <div className="h-full bg-amber rounded-full" style={{ width: `${s.progressPercent}%` }} />
                          </div>
                        </div>
                      )}
                      <div className="text-xs text-brown/40 pt-3 border-t border-amber/10">
                        Last listened: {formatRelativeTime(s.lastListened)}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
