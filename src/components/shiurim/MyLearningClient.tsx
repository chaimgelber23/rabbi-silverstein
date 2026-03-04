"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import AuthModal from "@/components/AuthModal";
import { getAllProgress, getProgressPercentage } from "@/lib/progress";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SeriesInfo {
  slug: string;
  name: string;
  episodeCount: number;
  group: string | null;
}

interface GroupInfo {
  id: string;
  label: string;
}

interface SeriesWithProgress {
  slug: string;
  name: string;
  episodeCount: number;
  listenedCount: number;
  completedCount: number;
  lastListened: string;
  lastShiurProgress: number;
  group: string | null;
}

interface GroupedSeriesCard {
  slug: string;          // group slug or series slug
  name: string;          // group label or series name
  episodeCount: number;
  listenedCount: number;
  completedCount: number;
  lastListened: string;
  lastShiurProgress: number;
  isGroup: boolean;
}

interface RecentShiur {
  shiurId: string;
  seriesSlug: string;
  seriesName: string;
  shiurTitle: string;
  progress: number;
  lastListened: string;
  completed: boolean;
}

interface LearningStats {
  totalShiurim: number;
  completedShiurim: number;
  inProgressShiurim: number;
  seriesStarted: number;
  totalMinutes: number;
  streak: number;
}

type TabId = "all" | "in-progress" | "completed";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function computeStreak(entries: { lastListened: string }[]): number {
  if (entries.length === 0) return 0;
  const days = new Set<string>();
  for (const e of entries) {
    days.add(new Date(e.lastListened).toLocaleDateString("en-US"));
  }
  const sorted = Array.from(days)
    .map((d) => new Date(d))
    .sort((a, b) => b.getTime() - a.getTime());

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Streak can start from today or yesterday
  if (sorted[0]?.getTime() !== today.getTime() && sorted[0]?.getTime() !== yesterday.getTime()) {
    return 0;
  }

  for (let i = 0; i < sorted.length; i++) {
    const expected = new Date(sorted[0]);
    expected.setDate(expected.getDate() - i);
    if (sorted[i].getTime() === expected.getTime()) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function computeData(allSeries: SeriesInfo[], groups: GroupInfo[], shiurTitles: Record<string, string>) {
  const all = getAllProgress();
  const entries = Object.values(all).filter((p) => p.currentTime > 10);
  const completed = entries.filter((p) => p.completed);
  const inProgress = entries.filter((p) => !p.completed);
  const totalSeconds = entries.reduce((acc, p) => acc + (p.currentTime || 0), 0);

  // Build series map
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

  // Build per-series progress
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
      group: series.group,
    });
  }

  // Consolidate grouped series into group-level cards
  const groupMap = new Map<string, GroupInfo>();
  for (const g of groups) groupMap.set(g.id, g);

  const groupBuckets = new Map<string, SeriesWithProgress[]>();
  const ungrouped: SeriesWithProgress[] = [];

  for (const sp of seriesProgress) {
    if (sp.group && groupMap.has(sp.group)) {
      const bucket = groupBuckets.get(sp.group) || [];
      bucket.push(sp);
      groupBuckets.set(sp.group, bucket);
    } else {
      ungrouped.push(sp);
    }
  }

  const cards: GroupedSeriesCard[] = [];

  for (const [groupId, bucket] of groupBuckets) {
    const gInfo = groupMap.get(groupId)!;
    const totalEp = bucket.reduce((a, s) => a + s.episodeCount, 0);
    const totalListened = bucket.reduce((a, s) => a + s.listenedCount, 0);
    const totalCompleted = bucket.reduce((a, s) => a + s.completedCount, 0);
    const latest = bucket.reduce((a, s) => (new Date(s.lastListened) > new Date(a) ? s.lastListened : a), bucket[0].lastListened);
    const latestSeries = bucket.reduce((best, s) => (new Date(s.lastListened) > new Date(best.lastListened) ? s : best), bucket[0]);

    cards.push({
      slug: groupId,
      name: gInfo.label,
      episodeCount: totalEp,
      listenedCount: totalListened,
      completedCount: totalCompleted,
      lastListened: latest,
      lastShiurProgress: latestSeries.lastShiurProgress,
      isGroup: true,
    });
  }

  for (const sp of ungrouped) {
    cards.push({
      slug: sp.slug,
      name: sp.name,
      episodeCount: sp.episodeCount,
      listenedCount: sp.listenedCount,
      completedCount: sp.completedCount,
      lastListened: sp.lastListened,
      lastShiurProgress: sp.lastShiurProgress,
      isGroup: false,
    });
  }

  cards.sort((a, b) => new Date(b.lastListened).getTime() - new Date(a.lastListened).getTime());

  // Recently played individual shiurim
  const recentShiurim: RecentShiur[] = entries
    .sort((a, b) => new Date(b.lastListened).getTime() - new Date(a.lastListened).getTime())
    .slice(0, 5)
    .map((p) => {
      const seriesInfo = allSeries.find((s) => s.slug === p.seriesSlug);
      let seriesName = seriesInfo?.name || "";
      if (seriesInfo?.group) {
        const g = groupMap.get(seriesInfo.group);
        if (g) seriesName = `${g.label} — ${seriesName}`;
      }
      return {
        shiurId: p.shiurId,
        shiurTitle: shiurTitles[p.shiurId] || p.shiurId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        seriesSlug: p.seriesSlug || "",
        seriesName,
        progress: p.duration > 0 ? Math.min(100, Math.round((p.currentTime / p.duration) * 100)) : 0,
        lastListened: p.lastListened,
        completed: p.completed,
      };
    });

  const streak = computeStreak(entries);

  const stats: LearningStats = {
    totalShiurim: entries.length,
    completedShiurim: completed.length,
    inProgressShiurim: inProgress.length,
    seriesStarted: seriesMap.size,
    totalMinutes: Math.round(totalSeconds / 60),
    streak,
  };

  return { stats, cards, recentShiurim };
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

/* ------------------------------------------------------------------ */
/*  Tabs                                                               */
/* ------------------------------------------------------------------ */

const TABS: { id: TabId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "in-progress", label: "In Progress" },
  { id: "completed", label: "Completed" },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function MyLearningClient({ allSeries, groups, shiurTitles }: { allSeries: SeriesInfo[]; groups: GroupInfo[]; shiurTitles: Record<string, string> }) {
  const { user, loading: authLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [stats, setStats] = useState<LearningStats>({ totalShiurim: 0, completedShiurim: 0, inProgressShiurim: 0, seriesStarted: 0, totalMinutes: 0, streak: 0 });
  const [cards, setCards] = useState<GroupedSeriesCard[]>([]);
  const [recentShiurim, setRecentShiurim] = useState<RecentShiur[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("all");

  useEffect(() => {
    const data = computeData(allSeries, groups, shiurTitles);
    setStats(data.stats);
    setCards(data.cards);
    setRecentShiurim(data.recentShiurim);
    setLoading(false);
  }, [allSeries, groups, user]);

  const filteredCards = useMemo(() => {
    if (activeTab === "all") return cards;
    if (activeTab === "in-progress") return cards.filter((c) => c.completedCount < c.episodeCount);
    return cards.filter((c) => c.completedCount >= c.episodeCount && c.episodeCount > 0);
  }, [cards, activeTab]);

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

  const hasProgress = cards.length > 0;

  return (
    <main className="min-h-screen bg-cream">
      {/* Hero */}
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
          ) : !hasProgress ? (
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

              {/* Recently Played */}
              {recentShiurim.length > 0 && (
                <div className="mb-10">
                  <h2 className="text-brown font-bold text-xl mb-4">Recently Played</h2>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {recentShiurim.map((rs) => (
                      <Link
                        key={rs.shiurId}
                        href={`/shiurim/${rs.seriesSlug}`}
                        className="bg-white border border-amber/15 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-amber/30 transition-all group flex items-center gap-3"
                      >
                        <div className="shrink-0 w-10 h-10 rounded-full bg-amber/10 flex items-center justify-center">
                          {rs.completed ? (
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          ) : (
                            <svg className="w-4 h-4 text-amber" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-brown font-semibold text-sm truncate group-hover:text-amber transition-colors">{rs.shiurTitle}</p>
                          <p className="text-brown/40 text-xs truncate">{rs.seriesName}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-amber text-xs font-semibold">{rs.completed ? "Done" : `${rs.progress}%`}</p>
                          <p className="text-brown/30 text-[10px]">{formatRelativeTime(rs.lastListened)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Tabs */}
              <div className="flex gap-1 mb-6 border-b border-brown/10">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-5 py-2.5 text-sm font-semibold transition-colors relative ${activeTab === tab.id
                      ? "text-amber"
                      : "text-brown/40 hover:text-brown/70"
                      }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber rounded-full" />
                    )}
                  </button>
                ))}
              </div>

              {/* Series / Group Progress Cards */}
              {filteredCards.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-brown/40 text-lg">
                    {activeTab === "completed"
                      ? "Keep going! You haven't finished a series yet."
                      : activeTab === "in-progress"
                        ? "No series in progress right now."
                        : "No series to show."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCards.map((s) => {
                    const pct = s.episodeCount > 0 ? Math.round((s.completedCount / s.episodeCount) * 100) : 0;
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
              )}

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
