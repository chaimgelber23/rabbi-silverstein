"use client";

import { useState } from "react";

export default function SubscribeButton({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const feedPath = `/shiurim/${slug}/feed.xml`;

  const copy = async () => {
    const url = (typeof window !== "undefined" ? window.location.origin : "") + feedPath;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-white border border-brown/15 text-brown/70 hover:border-brown/30 hover:text-brown transition-all flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 4.43A15.57 15.57 0 0 1 19.57 20h-2.2A13.37 13.37 0 0 0 4 6.63V4.43Zm0 5.2A10.37 10.37 0 0 1 14.37 20h-2.2A8.17 8.17 0 0 0 4 11.83V9.63ZM5.6 16.8a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4Z" />
        </svg>
        Subscribe
      </button>
      {open && (
        <div className="absolute left-0 z-30 mt-2 w-72 bg-white border border-brown/15 rounded-xl shadow-xl p-4 text-left">
          <p className="text-brown/70 text-xs leading-relaxed mb-3">
            Get each new shiur delivered in your podcast app. Copy this feed link and add it as a show
            (Apple&nbsp;Podcasts, Overcast, Pocket&nbsp;Casts, etc.):
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={copy}
              className="flex-1 bg-amber text-brown font-semibold text-sm px-3 py-2 rounded-lg hover:bg-amber-light transition-colors"
            >
              {copied ? "Copied!" : "Copy RSS link"}
            </button>
            <a
              href={feedPath}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-text text-sm font-semibold px-2 hover:text-brown transition-colors"
            >
              Open
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
