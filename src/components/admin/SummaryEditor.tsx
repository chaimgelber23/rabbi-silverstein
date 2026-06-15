"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { isAdmin } from "@/lib/admin";
import { getShiurMetaClient, saveShiurMeta, triggerRevalidation } from "@/lib/adminActions";

interface SlimShiur {
  id: string;
  title: string;
}

export default function SummaryEditor({ shiurim }: { shiurim: SlimShiur[] }) {
  const { user } = useAuth();
  const [meta, setMeta] = useState<Record<string, { summary?: string; takeaway?: string }>>({});
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<SlimShiur | null>(null);
  const [summary, setSummary] = useState("");
  const [takeaway, setTakeaway] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user && isAdmin()) getShiurMetaClient().then(setMeta);
  }, [user]);

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return shiurim.filter((s) => s.title.toLowerCase().includes(q)).slice(0, 12);
  }, [search, shiurim]);

  if (!user || !isAdmin()) return null;

  const pick = (s: SlimShiur) => {
    setSelected(s);
    setSummary(meta[s.id]?.summary || "");
    setTakeaway(meta[s.id]?.takeaway || "");
    setSaved(false);
    setSearch("");
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await saveShiurMeta(selected.id, { summary: summary.trim(), takeaway: takeaway.trim() });
      setMeta((m) => ({ ...m, [selected.id]: { summary: summary.trim(), takeaway: takeaway.trim() } }));
      setSaved(true);
      try {
        await triggerRevalidation("/");
      } catch {
        // non-fatal — content refreshes when the cache expires
      }
    } finally {
      setSaving(false);
    }
  };

  const countWithSummary = Object.values(meta).filter((m) => m.summary).length;

  return (
    <section className="bg-cream px-4 sm:px-6 pb-16">
      <div className="max-w-lg mx-auto border-t border-brown/10 pt-10">
        <h2 className="serif-heading text-brown text-2xl font-bold mb-1">Shiur Summaries</h2>
        <p className="text-brown/50 text-sm mb-6">
          Add a short written summary + key takeaway to any shiur. It shows on the shiur&apos;s page,
          as a preview on its card, and becomes searchable. {countWithSummary} written so far.
        </p>

        {!selected && (
          <div>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search a shiur by title…"
              aria-label="Search a shiur to summarize"
              className="w-full border border-brown/20 rounded-xl px-4 py-3 text-brown bg-white focus:outline-none focus:ring-2 focus:ring-amber/50"
            />
            {results.length > 0 && (
              <ul className="mt-2 bg-white border border-brown/10 rounded-xl divide-y divide-brown/10 overflow-hidden">
                {results.map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => pick(s)}
                      className="w-full text-left px-4 py-3 hover:bg-amber/5 transition-colors flex items-center justify-between gap-3"
                    >
                      <span className="text-brown text-sm truncate">{s.title}</span>
                      {meta[s.id]?.summary && (
                        <span className="text-amber-text text-xs font-semibold shrink-0">written</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {selected && (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-brown font-semibold text-sm">{selected.title}</p>
              <button
                onClick={() => setSelected(null)}
                className="text-brown/40 hover:text-brown text-sm shrink-0"
              >
                Change
              </button>
            </div>

            <div>
              <label className="block text-brown font-semibold text-sm mb-2">Summary</label>
              <textarea
                value={summary}
                onChange={(e) => {
                  setSummary(e.target.value);
                  setSaved(false);
                }}
                rows={4}
                placeholder="2–3 sentences on what this shiur covers…"
                className="w-full border border-brown/20 rounded-xl px-4 py-3 text-brown bg-white focus:outline-none focus:ring-2 focus:ring-amber/50 resize-none"
              />
            </div>

            <div>
              <label className="block text-brown font-semibold text-sm mb-2">Key takeaway (optional)</label>
              <textarea
                value={takeaway}
                onChange={(e) => {
                  setTakeaway(e.target.value);
                  setSaved(false);
                }}
                rows={2}
                placeholder="The one idea to walk away with…"
                className="w-full border border-brown/20 rounded-xl px-4 py-3 text-brown bg-white focus:outline-none focus:ring-2 focus:ring-amber/50 resize-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-amber text-brown font-bold px-6 py-3 rounded-xl hover:bg-amber-light transition-colors disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save summary"}
              </button>
              {saved && <span className="text-green-700 text-sm font-semibold">Saved ✓</span>}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
