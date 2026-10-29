"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserRound,
  LogOut,
  Bookmark,
  CalendarDays,
  Check,
  Copy,
  Trash2,
  ShieldAlert,
  Save,
  Sparkles,
  MapPin,
  GraduationCap,
  Bell,
  Code2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/sidequest/auth-state";
import { useBookmarks } from "@/components/sidequest/discovery-state";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { CITIES, THEMES } from "@/lib/hackathons";

const AVAILABLE_SKILLS = [
  "Python",
  "React",
  "TypeScript",
  "Node.js",
  "PyTorch",
  "Next.js",
  "Rust",
  "Go",
  "Solidity",
  "Flutter",
  "Docker",
  "PostgreSQL",
  "Tailwind CSS",
  "Figma",
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { saved } = useBookmarks();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Profile data
  const [skills, setSkills] = useState<string[]>(["React", "Python", "TypeScript"]);
  const [interests, setInterests] = useState<string[]>(["AI / ML", "Web development"]);
  const [city, setCity] = useState("Bengaluru");
  const [college, setCollege] = useState("IIT Bombay");
  const [telegramNotifications, setTelegramNotifications] = useState(true);

  // Load from local storage
  useEffect(() => {
    try {
      const savedSkills = localStorage.getItem("buildseek_user_skills");
      if (savedSkills) setSkills(JSON.parse(savedSkills));
      const savedInterests = localStorage.getItem("buildseek_user_interests");
      if (savedInterests) setInterests(JSON.parse(savedInterests));
      const savedCity = localStorage.getItem("buildseek_user_city");
      if (savedCity) setCity(savedCity);
      const savedCollege = localStorage.getItem("buildseek_user_college");
      if (savedCollege) setCollege(savedCollege);
    } catch {}
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem("buildseek_user_skills", JSON.stringify(skills));
      localStorage.setItem("buildseek_user_interests", JSON.stringify(interests));
      localStorage.setItem("buildseek_user_city", city);
      localStorage.setItem("buildseek_user_college", college);
      toast.success("Profile updated! Your match scores on Discover will reflect these changes.");
    } catch {}
  };

  const toggleSkill = (skill: string) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  async function signOut() {
    setBusy(true);
    setError("");
    const supabase = getSupabaseBrowserClient();
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("buildseek_demo_user");
      }
      const { error: err } = await supabase.auth.signOut();
      if (err) throw err;
      router.replace("/login");
    } catch {
      if (typeof window !== "undefined") {
        localStorage.removeItem("buildseek_demo_user");
      }
      router.replace("/login");
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    setError("");
    try {
      const res = await fetch("/api/user/account", { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Failed to delete account");
      }
      // Clear all local records as well
      localStorage.clear();
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut().catch(() => {});
      router.replace("/?account_deleted=true");
    } catch (err: any) {
      setError(err?.message || "Could not delete account. Please try again.");
      setDeleting(false);
    }
  }

  return (
    <main className="sq-departure-board-container" style={{ maxWidth: "840px" }}>
      {/* Header Banner */}
      <section className="sq-board-header-banner" aria-label="Profile Banner">
        <div className="sq-board-header-top">
          <span className="sq-board-station-tag">
            <UserRound size={15} /> Builder Identity
          </span>
          <span className="text-xs text-gray-300">
            {user ? user.email : "Guest Builder"}
          </span>
        </div>

        <h1 className="sq-board-title">Your Profile &amp; Preferences</h1>
        <p className="sq-board-subtitle">
          Configure your technical skills, campus, and interests to power personalized match scores across the departure board.
        </p>
      </section>

      {/* Main Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* 1. Technical Skills */}
        <div className="sq-departure-row p-6">
          <div className="flex items-center gap-2 mb-2">
            <Code2 size={18} className="text-navy" />
            <h2 className="font-display font-extrabold text-xl text-navy">
              Technical Skills
            </h2>
          </div>
          <p className="text-xs text-muted-foreground font-medium mb-4">
            Used to calculate the skill-match percentage on each hackathon row.
          </p>

          <div className="flex flex-wrap gap-2">
            {AVAILABLE_SKILLS.map((skill) => {
              const isSelected = skills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`sq-chip-btn ${isSelected ? "is-selected" : ""}`}
                  aria-pressed={isSelected}
                >
                  {isSelected && <Check size={12} />}
                  <span>{skill}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Interests & Focus Areas */}
        <div className="sq-departure-row p-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={18} className="text-navy" />
            <h2 className="font-display font-extrabold text-xl text-navy">
              Interests &amp; Hackathon Tracks
            </h2>
          </div>
          <p className="text-xs text-muted-foreground font-medium mb-4">
            We will prioritize notifications and board rankings matching these domains.
          </p>

          <div className="flex flex-wrap gap-2">
            {THEMES.map((theme) => {
              const isSelected = interests.includes(theme);
              return (
                <button
                  key={theme}
                  type="button"
                  onClick={() => toggleInterest(theme)}
                  className={`sq-chip-btn ${isSelected ? "is-selected" : ""}`}
                  aria-pressed={isSelected}
                >
                  {isSelected && <Check size={12} />}
                  <span>{theme}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Campus & City */}
        <div className="sq-departure-row p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-navy mb-2">
                <MapPin size={15} /> City / Region
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-2.5 bg-background border-2 border-navy rounded-xl text-sm font-semibold text-navy focus:outline-none focus:ring-2 focus:ring-brand shadow-[2px_2px_0_#0F1B33] min-h-[44px]"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-navy mb-2">
                <GraduationCap size={15} /> College / University
              </label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="e.g. BITS Pilani, IIT Delhi, PES Univ..."
                className="w-full p-2.5 bg-background border-2 border-navy rounded-xl text-sm font-semibold text-navy focus:outline-none focus:ring-2 focus:ring-brand shadow-[2px_2px_0_#0F1B33] min-h-[44px]"
              />
            </div>
          </div>
        </div>

        {/* 4. Notification Settings */}
        <div className="sq-departure-row p-6">
          <div className="flex items-center gap-2 mb-2">
            <Bell size={18} className="text-navy" />
            <h2 className="font-display font-extrabold text-xl text-navy">
              Notification Status
            </h2>
          </div>
          <label className="sq-toggle-row">
            <div className="sq-toggle-info">
              <span className="sq-toggle-title">Telegram Alerts Active</span>
              <span className="sq-toggle-sub">
                Deliver 24h &amp; 3h urgent countdown warnings to your Telegram account.
              </span>
            </div>
            <input
              type="checkbox"
              checked={telegramNotifications}
              onChange={(e) => setTelegramNotifications(e.target.checked)}
              className="sq-switch"
            />
          </label>
        </div>

        {/* Save CTA */}
        <div className="flex justify-end gap-4">
          <Button
            type="submit"
            className="bg-navy text-white hover:text-brand font-bold rounded-full border-2 border-navy shadow-[3px_3px_0_#0F1B33] text-sm min-h-[46px] px-6"
          >
            <Save size={16} /> Save Profile Changes
          </Button>
        </div>
      </form>

      {/* Account Control & DPDP / GDPR Erasure */}
      <section className="mt-12 pt-8 border-t-2 border-gray-300">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="font-condensed font-extrabold text-xl uppercase text-navy">
              Account Security &amp; Data Rights
            </h3>
            <p className="text-xs text-mutedText">
              Compliance with India&apos;s Digital Personal Data Protection Act 2023 (DPDP Act) and GDPR.
            </p>
          </div>

          {user && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={signOut}
              disabled={busy}
              className="border-navy text-navy"
            >
              <LogOut size={14} /> Sign out
            </Button>
          )}
        </div>

        {/* One-Click Erasure Card */}
        <div className="p-5 border-2 border-red-200 bg-red-50 rounded-lg">
          <div className="flex items-start gap-3">
            <ShieldAlert size={22} className="text-coral shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-bold text-coral text-sm">
                Permanent One-Click Account &amp; Data Erasure
              </h4>
              <p className="text-xs text-gray-700 leading-relaxed">
                Under the DPDP Act and GDPR, you possess the absolute right to erasure. Clicking Delete Account permanently and irreversibly wipes:
              </p>
              <ul className="text-xs text-gray-700 list-disc pl-4 space-y-1">
                <li>Your user account, email identifier, and authentication sessions</li>
                <li>All Quest Log bookmarks, custom notes, and registered application flags</li>
                <li>Your Telegram bot pairing ID and scheduled notification timers</li>
                <li>All skill profile parameters and search history logs</li>
              </ul>

              <div className="pt-2">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-coral text-white font-bold"
                >
                  <Trash2 size={14} /> Delete Account &amp; Erase All Data
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Deletion Confirmation Modal */}
        {showDeleteConfirm && (
          <div
            className="sq-sheet-backdrop"
            onClick={() => setShowDeleteConfirm(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Confirm permanent account erasure"
          >
            <div
              className="sq-bottom-sheet p-6"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "460px", borderRadius: "14px" }}
            >
              <h3 className="font-condensed font-extrabold text-xl uppercase text-coral mb-2">
                Confirm Account Erasure
              </h3>
              <p className="text-xs text-gray-700 leading-relaxed mb-6">
                Are you sure? This action is permanent and immediate. All your bookmarks, reminder hooks, and profile data will be permanently wiped from the database.
              </p>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={deleting}
                  onClick={handleDeleteAccount}
                  className="bg-coral text-white font-bold"
                >
                  {deleting ? "Erasing data…" : "Confirm Permanent Erasure"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
