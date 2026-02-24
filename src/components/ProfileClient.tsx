"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { useAuth } from "./AuthProvider";
import { getAllProgress, getSeriesProgress } from "@/lib/progress";

interface LearningStats {
  totalShiurim: number;
  completedShiurim: number;
  seriesStarted: number;
  totalMinutes: number;
}

function computeStats(): LearningStats {
  const all = getAllProgress();
  const entries = Object.values(all);
  const completed = entries.filter((p) => p.completed);
  const seriesSlugs = new Set(entries.map((p) => p.seriesSlug).filter(Boolean));
  const totalSeconds = entries.reduce((acc, p) => acc + (p.currentTime || 0), 0);

  return {
    totalShiurim: entries.length,
    completedShiurim: completed.length,
    seriesStarted: seriesSlugs.size,
    totalMinutes: Math.round(totalSeconds / 60),
  };
}

export default function ProfileClient() {
  const { user, loading: authLoading, signOut, resetPassword } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<LearningStats>({ totalShiurim: 0, completedShiurim: 0, seriesStarted: 0, totalMinutes: 0 });
  const [displayName, setDisplayName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [nameSaving, setNameSaving] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setStats(computeStats());
    }
  }, [user]);

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
    router.push("/");
    return null;
  }

  const initials = (user.displayName || user.email || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSaveName = async () => {
    if (!user) return;
    setNameSaving(true);
    try {
      await updateProfile(user, { displayName: displayName.trim() });
      setEditingName(false);
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 3000);
    } catch {
      // silently fail
    } finally {
      setNameSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;
    setPasswordError("");
    setPasswordSaving(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setPasswordSuccess(true);
      setChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred";
      if (msg.includes("auth/wrong-password") || msg.includes("auth/invalid-credential")) {
        setPasswordError("Current password is incorrect");
      } else if (msg.includes("auth/weak-password")) {
        setPasswordError("New password must be at least 6 characters");
      } else {
        setPasswordError("Failed to update password. Please try again.");
      }
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;
    try {
      await resetPassword(user.email);
      setResetSent(true);
      setTimeout(() => setResetSent(false), 5000);
    } catch {
      // silently fail
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const statItems = [
    { label: "Shiurim Started", value: stats.totalShiurim, icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" },
    { label: "Completed", value: stats.completedShiurim, icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
    { label: "Series Started", value: stats.seriesStarted, icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
    { label: "Minutes Listened", value: stats.totalMinutes, icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
  ];

  return (
    <main className="min-h-screen bg-cream">
      {/* Header */}
      <section className="bg-gradient-to-br from-brown to-brown-light text-white py-16 px-6">
        <div className="max-w-3xl mx-auto flex items-center gap-6">
          <div className="w-20 h-20 bg-amber/20 rounded-full flex items-center justify-center shrink-0">
            <span className="text-amber text-2xl font-bold">{initials}</span>
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-1">
              {user.displayName || "My Account"}
            </h1>
            <p className="text-white/60 text-sm">{user.email}</p>
          </div>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Learning Stats */}
          <div>
            <h2 className="text-brown font-bold text-xl mb-4">Learning Stats</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {statItems.map((item) => (
                <div key={item.label} className="bg-white border border-amber/15 rounded-xl p-5 text-center shadow-sm">
                  <div className="w-10 h-10 bg-amber/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-5 h-5 text-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                  </div>
                  <p className="text-brown text-2xl font-bold">{item.value}</p>
                  <p className="text-brown/50 text-xs mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Account Details */}
          <div>
            <h2 className="text-brown font-bold text-xl mb-4">Account Details</h2>
            <div className="bg-white border border-amber/15 rounded-xl shadow-sm divide-y divide-amber/10">
              {/* Email */}
              <div className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-brown/50 text-xs font-medium uppercase tracking-wider mb-1">Email</p>
                  <p className="text-brown font-medium">{user.email}</p>
                </div>
              </div>

              {/* Display Name */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-brown/50 text-xs font-medium uppercase tracking-wider">Display Name</p>
                  {!editingName && (
                    <button onClick={() => setEditingName(true)} className="text-amber text-sm font-medium hover:text-amber-light transition-colors">
                      Edit
                    </button>
                  )}
                </div>
                {editingName ? (
                  <div className="flex items-center gap-3 mt-2">
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="flex-1 px-3 py-2 border border-brown/20 rounded-lg text-brown focus:outline-none focus:ring-2 focus:ring-amber focus:border-transparent"
                      placeholder="Your name"
                      autoFocus
                    />
                    <button onClick={handleSaveName} disabled={nameSaving}
                      className="px-4 py-2 bg-amber text-white text-sm font-semibold rounded-lg hover:bg-amber-light transition-colors disabled:opacity-50">
                      {nameSaving ? "Saving..." : "Save"}
                    </button>
                    <button onClick={() => { setEditingName(false); setDisplayName(user.displayName || ""); }}
                      className="px-3 py-2 text-brown/50 text-sm font-medium hover:text-brown transition-colors">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <p className="text-brown font-medium">{user.displayName || <span className="text-brown/30 italic">Not set</span>}</p>
                )}
                {nameSuccess && <p className="text-green-600 text-sm mt-2">Name updated successfully</p>}
              </div>

              {/* Member Since */}
              <div className="p-5">
                <p className="text-brown/50 text-xs font-medium uppercase tracking-wider mb-1">Member Since</p>
                <p className="text-brown font-medium">
                  {user.metadata.creationTime
                    ? new Date(user.metadata.creationTime).toLocaleDateString("en-US", { month: "long", year: "numeric" })
                    : "Unknown"}
                </p>
              </div>
            </div>
          </div>

          {/* Security */}
          <div>
            <h2 className="text-brown font-bold text-xl mb-4">Security</h2>
            <div className="bg-white border border-amber/15 rounded-xl shadow-sm p-5">
              {passwordSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
                  Password updated successfully.
                </div>
              )}
              {resetSent && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
                  Password reset email sent! Check your inbox.
                </div>
              )}

              {changingPassword ? (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <h3 className="text-brown font-semibold">Change Password</h3>
                  {passwordError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">{passwordError}</div>
                  )}
                  <div>
                    <label className="block text-brown text-sm font-medium mb-1.5">Current Password</label>
                    <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber focus:border-transparent"
                      required minLength={6} />
                  </div>
                  <div>
                    <label className="block text-brown text-sm font-medium mb-1.5">New Password</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber focus:border-transparent"
                      placeholder="At least 6 characters" required minLength={6} />
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="submit" disabled={passwordSaving}
                      className="px-5 py-2 bg-amber text-white text-sm font-semibold rounded-lg hover:bg-amber-light transition-colors disabled:opacity-50">
                      {passwordSaving ? "Updating..." : "Update Password"}
                    </button>
                    <button type="button" onClick={() => { setChangingPassword(false); setPasswordError(""); setCurrentPassword(""); setNewPassword(""); }}
                      className="px-4 py-2 text-brown/50 text-sm font-medium hover:text-brown transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-brown font-medium">Password</p>
                    <p className="text-brown/50 text-sm">Last updated: Unknown</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setChangingPassword(true)}
                      className="px-4 py-2 bg-amber/10 text-amber text-sm font-semibold rounded-lg hover:bg-amber/20 transition-colors">
                      Change
                    </button>
                    <button onClick={handleResetPassword}
                      className="px-4 py-2 text-brown/50 text-sm font-medium hover:text-brown transition-colors">
                      Send Reset Email
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sign Out */}
          <div className="pt-4">
            <button onClick={handleSignOut}
              className="w-full py-3 border-2 border-brown/15 text-brown/60 font-semibold rounded-xl hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-all">
              Sign Out
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
