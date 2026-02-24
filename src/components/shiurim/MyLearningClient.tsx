"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import AuthModal from "@/components/AuthModal";
import { getAllProgress, getProgressPercentage } from "@/lib/progress";

interface SeriesInfo {
  slug: string;
  name: string;
  episodeCount: number;
}

interface SeriesWithProgress {
  slug: string;
  name: string;
  episodeCount: number;
  listenedCount: number;
  completedCount: number;
  lastListened: string;
  lastShiurProgress: number;
}

interface LearningStats {
  totalShiurim: number;
  completedShiurim: number;
  inProgressShiurim: number;
  seriesStarted: number;
  totalMinutes: number;
}

function computeData(allSeries: SeriesInfo[]) {
  const all = getAllProgress();
  const entries = Object.values(all).filter((p) => p.currentTime > 10);
  const completed = entries.filter((p) => p.completed);
  const inProgress = entries.filter((p) => !p.completed);
  const totalSeconds = entries.reduce((acc, p) => acc + (p.currentTime || 0), 0);

  const seriesMap = new Map<string, { listened: Set<string>; completed: Set<string>; lastListened: string; lastShiurId: string }>();
  for (const p of entries) {
    if (!p.seriesSlug) continue;
    const existing = seriesMap.get(p.seriesSlug);
    if (!existing) {
      seriesMap.set(p.seriesSlug, {
        listened: new Set([p.shiurId]),
        completed: p.completed ? new Set([p.shiurId]) : new Set(),
        lastListened: p.lastListened,
        lastShiurId: p.shiurId,
      });
    } else {
      existing.listened.add(p.shiurId);
      if (p.completed) existing.completed.add(p.shiurId);
      if (new Date(p.lastListened) > new Date(existing.lastListened)) {
        existing.lastListened = p.lastListened;
        existing.lastShiurId = p.shiurId;
      }
    }
  }

  const seriesProgress: SeriesWithProgress[] = [];
  for (const series of allSeries) {
    const data = seriesMap.get(series.slug);
    if (!data) continue;
    seriesProgress.push({
      slug: series.slug,
      name: series.name,
      episodeCount: series.episodeCount,
      listenedCount: data.listened.size,
      completedCount: data.completed.size,
      lastListened: data.lastListened,
      lastShiurProgress: getProgressPercentage(data.lastShiurId),
    });
  }
  seriesProgress.sort((a, b) => new Date(b.lastListened).getTime() - new Date(a.lastListened).getTime());

  const stats: LearningStats = {
    totalShiurim: entries.length,
    completedShiurim: completed.length,
    inProgressShiurim: inProgress.length,
    seriesStarted: seriesMap.size,
    totalMinutes: Math.round(totalSeconds / 60),
  };

  return { stats, seriesProgress };
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

function formatMinutes(mins: number): string {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function MyLearningClient({ allSeries }: { allSeries: SeriesInfo[] }) {
  const { user, loading: authLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [stats, setStats] = useState<LearningStats>({ totalShiurim: 0, completedShiurim: 0, inProgressShiurim: 0, seriesStarted: 0, totalMinutes: 0 });
  const [seriesProgress, setSeriesProgress] = useState<SeriesWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = computeData(allSeries);
    setStats(data.stats);
    setSeriesProgress(data.seriesProgress);
    setLoading(false);
  }, [allSeries]);

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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome back{user.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}
          </h1>
          <p className="text-white/80 text-lg">Continue your Torah learning journey</p>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber border-t-transparent" />
            </div>
          ) : seriesProgress.length === 0 ? (
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold text-brown mb-2">Start Your Learning Journey</h2>
              <p className="text-brown/60 mb-6">You haven&apos;t started any shiurim yet.</p>
              <Link href="/" className="inline-block bg-amber text-white px-8 py-3 rounded-xl font-semibold hover:bg-amber-light transition-colors">Browse Shiurim</Link>
            </div>
          ) : (
            <>
              {/* Stats Overview */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
                {[
                  { label: "Shiurim Started", value: stats.totalShiurim },
                  { label: "Completed", value: stats.completedShiurim },
                  { label: "In Progress", value: stats.inProgressShiurim },
                  { label: "Series", value: stats.seriesStarted },
                  { label: "Time Listened", value: formatMinutes(stats.totalMinutes) },
                ].map((item) => (
                  <div key={item.label} className="bg-white border border-amber/15 rounded-xl p-4 text-center shadow-sm">
                    <p className="text-brown text-2xl font-bold">{item.value}</p>
                    <p className="text-brown/50 text-xs mt-1">{item.label}</p>
                  </div>
                ))}
              </div>

              {/* Series Progress Cards */}
              <h2 className="text-brown font-bold text-2xl mb-6">Continue Learning</h2>
              <div className="space-y-4">
                {seriesProgress.map((s) => {
                  const pct = Math.round((s.completedCount / s.episodeCount) * 100);
                  return (
                    <Link key={s.slug} href={`/shiurim/${s.slug}`}
                      className="block bg-white border border-amber/15 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-amber/30 transition-all group">
                      <div className="flex items-center justify-between gap-4 mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-brown font-bold text-xl group-hover:text-amber transition-colors">{s.name}</h3>
                          <p className="text-brown/50 text-sm mt-1">
                            <span className="font-semibold text-brown/70">{s.completedCount}</span> / {s.episodeCount} shiurim completed
                            <span className="text-brown/30 mx-2">·</span>
                            Last listened {formatRelativeTime(s.lastListened)}
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-2 bg-amber text-white text-sm font-semibold rounded-xl px-5 py-2.5 shrink-0 shadow-sm group-hover:bg-amber-light transition-colors">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                          Continue
                        </span>
                      </div>
                      <div className="h-2.5 bg-brown/8 rounded-full overflow-hidden">
                        <div className="h-full bg-amber rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-brown/40 text-xs">{pct}% complete</p>
                        {s.lastShiurProgress > 0 && s.lastShiurProgress < 100 && (
                          <p className="text-amber text-xs font-medium">Current shiur: {s.lastShiurProgress}% listened</p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Browse More */}
              <div className="mt-10 text-center">
                <Link href="/" className="inline-flex items-center gap-2 border-2 border-amber/30 text-brown px-8 py-3 rounded-xl font-semibold hover:bg-amber/5 transition-colors">
                  <svg className="w-5 h-5 text-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Browse More Shiurim
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
