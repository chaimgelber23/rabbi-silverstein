"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";
import AuthModal from "./AuthModal";

export default function SignInBanner() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [showModal, setShowModal] = useState(false);

  if (user || dismissed) return null;

  return (
    <>
      <div className="bg-gradient-to-r from-amber via-amber-light to-amber text-white py-4 px-6 relative">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-lg">Sign in to track your learning</p>
              <p className="text-white/90 text-sm">Keep your place and sync across all your devices</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowModal(true)}
              className="bg-white text-amber px-6 py-2 rounded-lg font-bold text-sm hover:bg-white/90 transition-all shadow-md whitespace-nowrap">
              Sign In
            </button>
            <button onClick={() => setDismissed(true)} className="text-white/80 hover:text-white p-2" aria-label="Dismiss">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <AuthModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
