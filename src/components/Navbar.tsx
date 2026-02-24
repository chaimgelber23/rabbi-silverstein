"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "./AuthProvider";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="bg-brown text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-amber/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <span className="serif-heading text-lg font-bold text-amber group-hover:text-amber-light transition-colors">
                Rabbi Odom Silverstein
              </span>
              <span className="hidden sm:block text-white/50 text-xs">Torah Shiurim</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-white/80 hover:text-amber transition-colors text-sm font-medium">
              Shiurim
            </Link>
            <Link href="/my-learning" className="text-white/80 hover:text-amber transition-colors text-sm font-medium">
              My Learning
            </Link>
            {user ? (
              <Link href="/profile" className="flex items-center gap-2 text-white/80 hover:text-amber text-sm font-medium transition-colors">
                <div className="w-7 h-7 bg-amber/20 rounded-full flex items-center justify-center">
                  <span className="text-amber text-xs font-bold">
                    {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
                  </span>
                </div>
                Account
              </Link>
            ) : (
              <button onClick={() => setShowAuthModal(true)}
                className="bg-amber/20 hover:bg-amber/30 text-amber px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                Sign In
              </button>
            )}
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-white/80 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 px-6 py-4 space-y-3">
            <Link href="/" onClick={() => setMobileOpen(false)} className="block text-white/80 hover:text-amber transition-colors font-medium">
              Shiurim
            </Link>
            <Link href="/my-learning" onClick={() => setMobileOpen(false)} className="block text-white/80 hover:text-amber transition-colors font-medium">
              My Learning
            </Link>
            {user ? (
              <Link href="/profile" onClick={() => setMobileOpen(false)} className="block text-white/80 hover:text-amber font-medium transition-colors">
                My Account
              </Link>
            ) : (
              <button onClick={() => { setShowAuthModal(true); setMobileOpen(false); }} className="block text-amber font-semibold">
                Sign In
              </button>
            )}
          </div>
        )}
      </nav>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
