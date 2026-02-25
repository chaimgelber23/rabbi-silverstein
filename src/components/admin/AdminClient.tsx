"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { isAdmin } from "@/lib/admin";
import { SERIES, SERIES_GROUPS } from "@/lib/seriesConfig";
import {
  getCustomSeriesClient,
  getCustomGroupsClient,
  createCustomSeries,
  createCustomGroup,
  uploadAudio,
  saveCustomShiur,
  triggerRevalidation,
  getAudioDuration,
  formatDuration,
  generateSlug,
  getRecentUploads,
  deleteCustomShiur,
} from "@/lib/adminActions";
import type { RecentUpload } from "@/lib/adminActions";
import type { CustomSeriesDef, CustomGroupDef } from "@/lib/customData";
import Link from "next/link";
import AuthModal from "@/components/AuthModal";

// ========== Types ==========

type Step = "series" | "new-series" | "shiur" | "audio" | "review" | "uploading" | "success";

interface WizardState {
  seriesSlug: string;
  seriesName: string;
  isNewSeries: boolean;
  newSeriesName: string;
  newSeriesDescription: string;
  newSeriesGroup: string | null;
  isNewGroup: boolean;
  newGroupName: string;
  newGroupDescription: string;
  newSeriesNavType: "sequential" | "perek";
  shiurTitle: string;
  shiurDescription: string;
  perekNumber: string;
  audioFile: File | null;
  audioDuration: number;
}

const initialState: WizardState = {
  seriesSlug: "",
  seriesName: "",
  isNewSeries: false,
  newSeriesName: "",
  newSeriesDescription: "",
  newSeriesGroup: null,
  isNewGroup: false,
  newGroupName: "",
  newGroupDescription: "",
  newSeriesNavType: "sequential",
  shiurTitle: "",
  shiurDescription: "",
  perekNumber: "",
  audioFile: null,
  audioDuration: 0,
};

// ========== Main Component ==========

export default function AdminClient() {
  const { user, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [step, setStep] = useState<Step>("series");
  const [state, setState] = useState<WizardState>(initialState);
  const [customSeries, setCustomSeries] = useState<CustomSeriesDef[]>([]);
  const [customGroups, setCustomGroups] = useState<CustomGroupDef[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recentUploads, setRecentUploads] = useState<RecentUpload[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showRecent, setShowRecent] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Load existing custom data
  useEffect(() => {
    if (user && isAdmin()) {
      getCustomSeriesClient().then(setCustomSeries);
      getCustomGroupsClient().then(setCustomGroups);
      getRecentUploads().then(setRecentUploads);
    }
  }, [user]);

  // Auth loading
  if (loading) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-brown/50 text-lg">Loading...</div>
      </main>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-brown/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-brown/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="serif-heading text-brown text-2xl font-bold mb-2">Admin Access Required</h1>
          <p className="text-brown/60 mb-6">Please sign in with your admin account to upload shiurim.</p>
          <button
            onClick={() => setShowAuth(true)}
            className="bg-brown text-amber font-semibold px-8 py-3 rounded-xl hover:bg-brown-light transition-colors"
          >
            Sign In
          </button>
          <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
        </div>
      </main>
    );
  }

  // Not admin
  if (!isAdmin()) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h1 className="serif-heading text-brown text-2xl font-bold mb-2">Not Authorized</h1>
          <p className="text-brown/60 mb-6">This page is restricted to admin users.</p>
          <Link href="/" className="text-amber font-semibold hover:text-amber-light transition-colors">
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  // Merge all series for dropdown
  const allSeriesOptions = [
    ...SERIES.map((s) => ({
      slug: s.slug,
      name: s.group
        ? `${(SERIES_GROUPS as Record<string, { label: string }>)[s.group]?.label || s.group} — ${s.name}`
        : s.slug === "other"
          ? "Other / Talks & Events"
          : s.name,
    })),
    ...customSeries.map((s) => ({ slug: s.slug, name: s.name })),
  ];

  // Merge all groups for dropdown
  const allGroupOptions = [
    ...Object.entries(SERIES_GROUPS).map(([id, g]) => ({
      slug: id,
      label: g.label,
    })),
    ...customGroups.map((g) => ({ slug: g.slug, label: g.label })),
  ];

  const update = (partial: Partial<WizardState>) =>
    setState((prev) => ({ ...prev, ...partial }));

  // ========== Audio Recording ==========

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const file = new File([blob], `recording-${Date.now()}.webm`, {
          type: "audio/webm",
        });
        const duration = await getAudioDuration(file);
        update({ audioFile: file, audioDuration: duration });
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch {
      setError("Could not access microphone. Please allow microphone access and try again.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }

  // ========== File Selection ==========

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const duration = await getAudioDuration(file);
      update({ audioFile: file, audioDuration: duration });
      setError("");
    } catch {
      update({ audioFile: file, audioDuration: 0 });
    }
  }

  // ========== Upload ==========

  async function handleUpload() {
    setStep("uploading");
    setError("");
    setUploadProgress(0);

    try {
      let seriesSlug = state.seriesSlug;

      // Create new group if needed
      if (state.isNewSeries && state.isNewGroup && state.newGroupName.trim()) {
        const groupSlug = generateSlug(state.newGroupName);
        await createCustomGroup({
          slug: groupSlug,
          label: state.newGroupName.trim(),
          description: state.newGroupDescription.trim(),
        });
        // Update state for series creation
        state.newSeriesGroup = groupSlug;
      }

      // Create new series if needed
      if (state.isNewSeries && state.newSeriesName.trim()) {
        seriesSlug = generateSlug(state.newSeriesName);
        await createCustomSeries({
          slug: seriesSlug,
          name: state.newSeriesName.trim(),
          description: state.newSeriesDescription.trim(),
          group: state.isNewGroup
            ? generateSlug(state.newGroupName)
            : state.newSeriesGroup,
          navType: state.newSeriesNavType,
          sortDefault: state.newSeriesNavType === "perek" ? "oldest" : "newest",
        });
      }

      // Upload audio
      if (!state.audioFile) throw new Error("No audio file selected");
      const { url, storagePath } = await uploadAudio(
        seriesSlug,
        state.audioFile,
        setUploadProgress
      );

      // Save shiur metadata
      const durationSeconds = Math.round(state.audioDuration);
      await saveCustomShiur({
        title: state.shiurTitle.trim(),
        seriesSlug,
        audioUrl: url,
        storagePath,
        duration: formatDuration(durationSeconds),
        durationSeconds,
        description: state.shiurDescription.trim(),
        perekNumber: state.perekNumber ? parseInt(state.perekNumber) : null,
      });

      // Trigger revalidation
      try {
        await triggerRevalidation(`/shiurim/${seriesSlug}`);
      } catch {
        // Non-fatal — content will appear after cache expires
      }

      update({ seriesSlug: seriesSlug });
      setStep("success");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
      setStep("review");
    }
  }

  // ========== Navigation Helpers ==========

  function getStepNumber(): number {
    const steps: Step[] = ["series", "new-series", "shiur", "audio", "review"];
    const idx = steps.indexOf(step);
    if (step === "new-series") return 2;
    if (step === "shiur") return state.isNewSeries ? 3 : 2;
    if (step === "audio") return state.isNewSeries ? 4 : 3;
    if (step === "review") return state.isNewSeries ? 5 : 4;
    return idx + 1;
  }

  function getTotalSteps(): number {
    return state.isNewSeries ? 5 : 4;
  }

  const currentSeriesNavType = state.isNewSeries
    ? state.newSeriesNavType
    : SERIES.find((s) => s.slug === state.seriesSlug)?.navType ||
      customSeries.find((s) => s.slug === state.seriesSlug)?.navType ||
      "sequential";

  // ========== Render ==========

  return (
    <main className="min-h-screen bg-cream py-8 px-4 sm:px-6">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-brown/40 text-sm hover:text-brown transition-colors">
            &larr; Back to Site
          </Link>
          <h1 className="serif-heading text-brown text-3xl font-bold mt-4 mb-1">
            Upload Shiur
          </h1>
          <p className="text-brown/50 text-sm">Add a new shiur to the site</p>
        </div>

        {/* Progress Bar */}
        {!["uploading", "success"].includes(step) && (
          <div className="flex items-center gap-2 mb-8">
            {Array.from({ length: getTotalSteps() }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i < getStepNumber()
                    ? "bg-amber"
                    : "bg-brown/10"
                }`}
              />
            ))}
            <span className="text-brown/40 text-xs ml-1">
              {getStepNumber()}/{getTotalSteps()}
            </span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm">
            {error}
          </div>
        )}

        {/* ========== STEP: Choose Series ========== */}
        {step === "series" && (
          <div className="space-y-6">
            <div>
              <label className="block text-brown font-semibold text-sm mb-3">
                Which sefer is this shiur for?
              </label>
              <select
                value={state.seriesSlug}
                onChange={(e) => {
                  update({
                    seriesSlug: e.target.value,
                    seriesName:
                      allSeriesOptions.find((s) => s.slug === e.target.value)
                        ?.name || "",
                    isNewSeries: false,
                  });
                }}
                className="w-full border border-brown/20 rounded-xl px-4 py-3.5 text-brown bg-white focus:outline-none focus:ring-2 focus:ring-amber/50 text-base"
              >
                <option value="">Select a sefer...</option>
                {allSeriesOptions.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative flex items-center gap-4">
              <div className="flex-1 border-t border-brown/10" />
              <span className="text-brown/30 text-sm">or</span>
              <div className="flex-1 border-t border-brown/10" />
            </div>

            <button
              onClick={() => {
                update({ isNewSeries: true, seriesSlug: "" });
                setStep("new-series");
              }}
              className="w-full border-2 border-dashed border-amber/40 rounded-xl px-4 py-4 text-amber font-semibold hover:border-amber hover:bg-amber/5 transition-all text-base"
            >
              + Create New Sefer
            </button>

            <button
              onClick={() => setStep("shiur")}
              disabled={!state.seriesSlug}
              className="w-full bg-brown text-amber font-semibold py-4 rounded-xl hover:bg-brown-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-base"
            >
              Continue
            </button>
          </div>
        )}

        {/* ========== STEP: New Series ========== */}
        {step === "new-series" && (
          <div className="space-y-5">
            <h2 className="serif-heading text-brown text-xl font-bold">
              New Sefer Details
            </h2>

            <div>
              <label className="block text-brown font-semibold text-sm mb-2">
                Sefer Name *
              </label>
              <input
                type="text"
                value={state.newSeriesName}
                onChange={(e) => update({ newSeriesName: e.target.value })}
                placeholder="e.g., Mesilas Yesharim"
                className="w-full border border-brown/20 rounded-xl px-4 py-3.5 text-brown bg-white focus:outline-none focus:ring-2 focus:ring-amber/50 text-base"
              />
            </div>

            <div>
              <label className="block text-brown font-semibold text-sm mb-2">
                Description
              </label>
              <textarea
                value={state.newSeriesDescription}
                onChange={(e) =>
                  update({ newSeriesDescription: e.target.value })
                }
                placeholder="A short description of this sefer..."
                rows={3}
                className="w-full border border-brown/20 rounded-xl px-4 py-3 text-brown bg-white focus:outline-none focus:ring-2 focus:ring-amber/50 text-base resize-none"
              />
            </div>

            <div>
              <label className="block text-brown font-semibold text-sm mb-2">
                Group (section on the home page)
              </label>
              <select
                value={
                  state.isNewGroup
                    ? "__new__"
                    : state.newSeriesGroup || ""
                }
                onChange={(e) => {
                  if (e.target.value === "__new__") {
                    update({ isNewGroup: true, newSeriesGroup: null });
                  } else {
                    update({
                      isNewGroup: false,
                      newSeriesGroup: e.target.value || null,
                    });
                  }
                }}
                className="w-full border border-brown/20 rounded-xl px-4 py-3.5 text-brown bg-white focus:outline-none focus:ring-2 focus:ring-amber/50 text-base"
              >
                <option value="">No group (standalone)</option>
                {allGroupOptions.map((g) => (
                  <option key={g.slug} value={g.slug}>
                    {g.label}
                  </option>
                ))}
                <option value="__new__">+ Create new group</option>
              </select>
            </div>

            {state.isNewGroup && (
              <div className="space-y-4 pl-4 border-l-2 border-amber/30">
                <div>
                  <label className="block text-brown font-semibold text-sm mb-2">
                    Group Name *
                  </label>
                  <input
                    type="text"
                    value={state.newGroupName}
                    onChange={(e) => update({ newGroupName: e.target.value })}
                    placeholder="e.g., Mussar"
                    className="w-full border border-brown/20 rounded-xl px-4 py-3.5 text-brown bg-white focus:outline-none focus:ring-2 focus:ring-amber/50 text-base"
                  />
                </div>
                <div>
                  <label className="block text-brown font-semibold text-sm mb-2">
                    Group Description
                  </label>
                  <input
                    type="text"
                    value={state.newGroupDescription}
                    onChange={(e) =>
                      update({ newGroupDescription: e.target.value })
                    }
                    placeholder="A short description..."
                    className="w-full border border-brown/20 rounded-xl px-4 py-3.5 text-brown bg-white focus:outline-none focus:ring-2 focus:ring-amber/50 text-base"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-brown font-semibold text-sm mb-2">
                How are shiurim organized?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => update({ newSeriesNavType: "sequential" })}
                  className={`rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all ${
                    state.newSeriesNavType === "sequential"
                      ? "border-amber bg-amber/10 text-brown"
                      : "border-brown/15 text-brown/50 hover:border-brown/30"
                  }`}
                >
                  Sequential
                  <span className="block text-xs mt-0.5 opacity-60">
                    One after another
                  </span>
                </button>
                <button
                  onClick={() => update({ newSeriesNavType: "perek" })}
                  className={`rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all ${
                    state.newSeriesNavType === "perek"
                      ? "border-amber bg-amber/10 text-brown"
                      : "border-brown/15 text-brown/50 hover:border-brown/30"
                  }`}
                >
                  By Perek
                  <span className="block text-xs mt-0.5 opacity-60">
                    Organized by chapter
                  </span>
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  update({ isNewSeries: false });
                  setStep("series");
                }}
                className="flex-1 border border-brown/20 text-brown font-semibold py-4 rounded-xl hover:bg-brown/5 transition-colors text-base"
              >
                Back
              </button>
              <button
                onClick={() => setStep("shiur")}
                disabled={
                  !state.newSeriesName.trim() ||
                  (state.isNewGroup && !state.newGroupName.trim())
                }
                className="flex-1 bg-brown text-amber font-semibold py-4 rounded-xl hover:bg-brown-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-base"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ========== STEP: Shiur Details ========== */}
        {step === "shiur" && (
          <div className="space-y-5">
            <h2 className="serif-heading text-brown text-xl font-bold">
              Shiur Details
            </h2>

            <div>
              <label className="block text-brown font-semibold text-sm mb-2">
                Shiur Title *
              </label>
              <input
                type="text"
                value={state.shiurTitle}
                onChange={(e) => update({ shiurTitle: e.target.value })}
                placeholder={
                  currentSeriesNavType === "perek"
                    ? "e.g., Mesilas Yesharim Perek 3"
                    : "e.g., The Power of Tefilla"
                }
                className="w-full border border-brown/20 rounded-xl px-4 py-3.5 text-brown bg-white focus:outline-none focus:ring-2 focus:ring-amber/50 text-base"
              />
            </div>

            {currentSeriesNavType === "perek" && (
              <div>
                <label className="block text-brown font-semibold text-sm mb-2">
                  Perek Number
                </label>
                <input
                  type="number"
                  value={state.perekNumber}
                  onChange={(e) => update({ perekNumber: e.target.value })}
                  placeholder="e.g., 3"
                  min="1"
                  className="w-full border border-brown/20 rounded-xl px-4 py-3.5 text-brown bg-white focus:outline-none focus:ring-2 focus:ring-amber/50 text-base"
                />
              </div>
            )}

            <div>
              <label className="block text-brown font-semibold text-sm mb-2">
                Description (optional)
              </label>
              <textarea
                value={state.shiurDescription}
                onChange={(e) => update({ shiurDescription: e.target.value })}
                placeholder="A brief summary of the shiur..."
                rows={3}
                className="w-full border border-brown/20 rounded-xl px-4 py-3 text-brown bg-white focus:outline-none focus:ring-2 focus:ring-amber/50 text-base resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() =>
                  setStep(state.isNewSeries ? "new-series" : "series")
                }
                className="flex-1 border border-brown/20 text-brown font-semibold py-4 rounded-xl hover:bg-brown/5 transition-colors text-base"
              >
                Back
              </button>
              <button
                onClick={() => setStep("audio")}
                disabled={!state.shiurTitle.trim()}
                className="flex-1 bg-brown text-amber font-semibold py-4 rounded-xl hover:bg-brown-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-base"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ========== STEP: Audio Upload/Record ========== */}
        {step === "audio" && (
          <div className="space-y-6">
            <h2 className="serif-heading text-brown text-xl font-bold">
              Audio File
            </h2>

            {/* File Upload */}
            <div>
              <label className="block text-brown font-semibold text-sm mb-3">
                Upload a file
              </label>
              <label className="block w-full cursor-pointer">
                <div
                  className={`border-2 border-dashed rounded-xl px-4 py-8 text-center transition-all ${
                    state.audioFile
                      ? "border-amber bg-amber/5"
                      : "border-brown/20 hover:border-amber/50"
                  }`}
                >
                  {state.audioFile ? (
                    <div>
                      <svg
                        className="w-10 h-10 text-amber mx-auto mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <p className="text-brown font-medium text-sm">
                        {state.audioFile.name}
                      </p>
                      <p className="text-brown/50 text-xs mt-1">
                        {state.audioDuration > 0
                          ? formatDuration(Math.round(state.audioDuration))
                          : "Duration unknown"}{" "}
                        &bull;{" "}
                        {(state.audioFile.size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                      <p className="text-amber text-xs mt-2">
                        Tap to change file
                      </p>
                    </div>
                  ) : (
                    <div>
                      <svg
                        className="w-10 h-10 text-brown/30 mx-auto mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="text-brown/60 font-medium">
                        Tap to select audio file
                      </p>
                      <p className="text-brown/40 text-xs mt-1">
                        MP3, M4A, WAV, or WebM
                      </p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>

            <div className="relative flex items-center gap-4">
              <div className="flex-1 border-t border-brown/10" />
              <span className="text-brown/30 text-sm">or</span>
              <div className="flex-1 border-t border-brown/10" />
            </div>

            {/* Record Audio */}
            <div>
              <label className="block text-brown font-semibold text-sm mb-3">
                Record now
              </label>
              {isRecording ? (
                <button
                  onClick={stopRecording}
                  className="w-full bg-red-500 text-white font-semibold py-5 rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center gap-3 text-base"
                >
                  <span className="w-3 h-3 bg-white rounded-full animate-pulse" />
                  Stop Recording
                </button>
              ) : (
                <button
                  onClick={startRecording}
                  className="w-full border-2 border-brown/20 text-brown font-semibold py-5 rounded-xl hover:border-amber hover:bg-amber/5 transition-all flex items-center justify-center gap-3 text-base"
                >
                  <svg
                    className="w-6 h-6 text-amber"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                  </svg>
                  Record Shiur
                </button>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep("shiur")}
                className="flex-1 border border-brown/20 text-brown font-semibold py-4 rounded-xl hover:bg-brown/5 transition-colors text-base"
              >
                Back
              </button>
              <button
                onClick={() => setStep("review")}
                disabled={!state.audioFile}
                className="flex-1 bg-brown text-amber font-semibold py-4 rounded-xl hover:bg-brown-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-base"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ========== STEP: Review ========== */}
        {step === "review" && (
          <div className="space-y-6">
            <h2 className="serif-heading text-brown text-xl font-bold">
              Review & Upload
            </h2>

            <div className="bg-white rounded-xl border border-brown/10 divide-y divide-brown/10">
              <div className="px-4 py-3">
                <span className="text-brown/40 text-xs uppercase tracking-wider">
                  Sefer
                </span>
                <p className="text-brown font-medium mt-0.5">
                  {state.isNewSeries
                    ? `${state.newSeriesName} (new)`
                    : state.seriesName || state.seriesSlug}
                </p>
              </div>
              {state.isNewSeries && state.newSeriesGroup && (
                <div className="px-4 py-3">
                  <span className="text-brown/40 text-xs uppercase tracking-wider">
                    Group
                  </span>
                  <p className="text-brown font-medium mt-0.5">
                    {state.isNewGroup
                      ? `${state.newGroupName} (new)`
                      : allGroupOptions.find(
                          (g) => g.slug === state.newSeriesGroup
                        )?.label || state.newSeriesGroup}
                  </p>
                </div>
              )}
              <div className="px-4 py-3">
                <span className="text-brown/40 text-xs uppercase tracking-wider">
                  Title
                </span>
                <p className="text-brown font-medium mt-0.5">
                  {state.shiurTitle}
                </p>
              </div>
              {state.perekNumber && (
                <div className="px-4 py-3">
                  <span className="text-brown/40 text-xs uppercase tracking-wider">
                    Perek
                  </span>
                  <p className="text-brown font-medium mt-0.5">
                    {state.perekNumber}
                  </p>
                </div>
              )}
              {state.shiurDescription && (
                <div className="px-4 py-3">
                  <span className="text-brown/40 text-xs uppercase tracking-wider">
                    Description
                  </span>
                  <p className="text-brown/70 text-sm mt-0.5">
                    {state.shiurDescription}
                  </p>
                </div>
              )}
              <div className="px-4 py-3">
                <span className="text-brown/40 text-xs uppercase tracking-wider">
                  Audio
                </span>
                <p className="text-brown font-medium mt-0.5">
                  {state.audioFile?.name}
                </p>
                <p className="text-brown/50 text-xs">
                  {state.audioDuration > 0
                    ? formatDuration(Math.round(state.audioDuration))
                    : ""}{" "}
                  {state.audioFile
                    ? `${(state.audioFile.size / (1024 * 1024)).toFixed(1)} MB`
                    : ""}
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep("audio")}
                className="flex-1 border border-brown/20 text-brown font-semibold py-4 rounded-xl hover:bg-brown/5 transition-colors text-base"
              >
                Back
              </button>
              <button
                onClick={handleUpload}
                className="flex-1 bg-amber text-brown font-bold py-4 rounded-xl hover:bg-amber-light transition-colors text-base"
              >
                Upload Shiur
              </button>
            </div>
          </div>
        )}

        {/* ========== STEP: Uploading ========== */}
        {step === "uploading" && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-amber/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-amber animate-pulse"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <h2 className="serif-heading text-brown text-2xl font-bold mb-2">
              Uploading...
            </h2>
            <p className="text-brown/50 mb-6">Please wait while your shiur is uploaded</p>

            <div className="w-full bg-brown/10 rounded-full h-3 mb-2">
              <div
                className="bg-amber h-3 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-brown/40 text-sm">{uploadProgress}%</p>
          </div>
        )}

        {/* ========== STEP: Success ========== */}
        {step === "success" && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="serif-heading text-brown text-2xl font-bold mb-2">
              Shiur Uploaded!
            </h2>
            <p className="text-brown/50 mb-8">
              Your shiur has been added to the site successfully.
            </p>

            <div className="space-y-3">
              <Link
                href={`/shiurim/${state.seriesSlug}`}
                className="block w-full bg-brown text-amber font-semibold py-4 rounded-xl hover:bg-brown-light transition-colors text-base"
              >
                View Series
              </Link>
              <button
                onClick={() => {
                  setState(initialState);
                  setStep("series");
                  setError("");
                  setUploadProgress(0);
                  // Refresh custom data
                  getCustomSeriesClient().then(setCustomSeries);
                  getCustomGroupsClient().then(setCustomGroups);
                  getRecentUploads().then(setRecentUploads);
                }}
                className="block w-full border border-brown/20 text-brown font-semibold py-4 rounded-xl hover:bg-brown/5 transition-colors text-base"
              >
                Upload Another
              </button>
            </div>
          </div>
        )}

        {/* ========== Recent Uploads ========== */}
        {!["uploading", "success"].includes(step) && (
          <div className="mt-12 border-t border-brown/10 pt-8">
            <button
              onClick={() => {
                setShowRecent(!showRecent);
                if (!showRecent) getRecentUploads().then(setRecentUploads);
              }}
              className="flex items-center gap-2 text-brown/50 hover:text-brown transition-colors text-sm font-medium"
            >
              <svg
                className={`w-4 h-4 transition-transform ${showRecent ? "rotate-90" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Recent Uploads ({recentUploads.length})
            </button>

            {showRecent && (
              <div className="mt-4 space-y-2">
                {recentUploads.length === 0 ? (
                  <p className="text-brown/40 text-sm py-4 text-center">No uploads yet</p>
                ) : (
                  recentUploads.map((upload) => (
                    <div
                      key={upload.id}
                      className="flex items-center justify-between bg-white border border-brown/10 rounded-xl px-4 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-brown font-medium text-sm truncate">
                          {upload.title}
                        </p>
                        <p className="text-brown/40 text-xs">
                          {upload.seriesSlug} &bull; {upload.duration || "—"}
                          {upload.pubDate &&
                            ` \u2022 ${new Date(upload.pubDate).toLocaleDateString()}`}
                        </p>
                      </div>
                      {deletingId === upload.id ? (
                        <div className="flex items-center gap-2 ml-3">
                          <span className="text-red-500 text-xs">Delete?</span>
                          <button
                            onClick={async () => {
                              try {
                                await deleteCustomShiur(upload.id, upload.storagePath);
                                setRecentUploads((prev) =>
                                  prev.filter((u) => u.id !== upload.id)
                                );
                                setDeletingId(null);
                                try {
                                  await triggerRevalidation(`/shiurim/${upload.seriesSlug}`);
                                } catch { /* non-fatal */ }
                              } catch {
                                setError("Failed to delete shiur");
                                setDeletingId(null);
                              }
                            }}
                            className="text-red-600 font-semibold text-xs px-2 py-1 rounded hover:bg-red-50"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setDeletingId(null)}
                            className="text-brown/50 text-xs px-2 py-1 rounded hover:bg-brown/5"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeletingId(upload.id)}
                          className="text-brown/30 hover:text-red-500 transition-colors ml-3 p-1"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
