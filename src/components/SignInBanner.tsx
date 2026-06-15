"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import AuthModal from "./AuthModal";

const DISMISS_KEY = "ros-signin-dismissed";

export default function SignInBanner() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // SSR-safe: server renders the banner (dismissed=false); after mount we read
    // localStorage and hide it if previously dismissed. A lazy initializer would
    // diverge from the server HTML and cause a hydration mismatch, so this stays.
    if (typeof window !== "undefined" && localStorage.getItem(DISMISS_KEY) === "1") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDismissed(true);
    }
  }, []);

  if (user || dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore storage failures (private mode etc.)
    }
  };

  return (
    <>
      <div className="px-6 py-2 bg-cream">
        <div className="max-w-6xl mx-auto flex justify-end items-center gap-1">
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 text-brown/60 hover:text-brown text-sm font-medium transition-colors">
            <svg aria-hidden="true" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
            </svg>
            Sign in to track progress
          </button>
          <button onClick={dismiss} aria-label="Dismiss"
            className="p-1 text-brown/40 hover:text-brown/70 transition-colors">
            <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <AuthModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
