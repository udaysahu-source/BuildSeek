"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserRound, LogOut, Bookmark, CalendarDays, Check, Copy, ArrowUpRight } from "lucide-react";
import { useAuth } from "@/components/sidequest/auth-state";
import { useBookmarks } from "@/components/sidequest/discovery-state";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { saved } = useBookmarks();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [tokenCopied, setTokenCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const calendarUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/calendar/user-quest-token-2026`
      : `/api/calendar/user-quest-token-2026`;

  async function signOut() {
    setBusy(true);
    setError("");
    const supabase = getSupabaseBrowserClient();
    try {
      const { error: err } = await supabase.auth.signOut();
      if (err) throw err;
      router.replace("/login");
    } catch {
      setError("Could not sign out. Please try again.");
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
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut().catch(() => {});
      router.replace("/?account_deleted=true");
    } catch (err: any) {
      setError(err?.message || "Could not delete account. Please try again.");
      setDeleting(false);
    }
  }

  const copyCalendar = () => {
    navigator.clipboard.writeText(calendarUrl);
    setTokenCopied(true);
    setTimeout(() => setTokenCopied(false), 2000);
  };

  return (
    <main className="sq-account-page sq-container">
      <div className="sq-recovery">
        <span className="sq-account-avatar">
          <UserRound size={38} />
        </span>
        <h1>Your account.</h1>

        {loading ? (
          <p role="status" style={{ color: "var(--muted-foreground)", fontSize: "14px" }}>
            Checking account session…
          </p>
        ) : user ? (
          <>
            <p className="sq-account-email">{user.email}</p>
            <p>
              <Bookmark size={16} className="inline mr-1" />
              {saved.length} saved quests in your Quest Log
            </p>

            <div className="sq-placeholder-actions">
              <Button asChild>
                <Link href="/quest-log">
                  Open Quest Log <ArrowUpRight size={16} />
                </Link>
              </Button>
              <Button variant="outline" disabled={busy} onClick={signOut}>
                <LogOut size={17} />
                {busy ? "Signing out…" : "Sign out"}
              </Button>
            </div>

            <div className="mt-8 pt-6 border-t border-border w-full text-left">
              <span className="sq-eyebrow">Personal Calendar Feed</span>
              <p className="text-sm text-muted-foreground mt-1 mb-3">
                Subscribe in Google Calendar, Apple Calendar, or Outlook to get live deadline radar alerts directly in your schedule.
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={copyCalendar}>
                  {tokenCopied ? <Check size={14} /> : <Copy size={14} />}
                  {tokenCopied ? "Link Copied!" : "Copy iCal Subscription Link"}
                </Button>
              </div>
            </div>

            {/* Privacy & Cascading Account Deletion (DPDP Act & GDPR compliant) */}
            <div className="mt-8 pt-6 border-t border-border w-full text-left">
              <span className="sq-eyebrow" style={{ color: "#b91c1c" }}>Data Privacy & Erasure</span>
              <p className="text-sm text-muted-foreground mt-1 mb-3">
                Permanently erase your account, personal data, saved quests, alert rules, and active sessions in accordance with the DPDP Act and GDPR. This action is irreversible.
              </p>
              {!showDeleteConfirm ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="sq-destructive-btn"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete Account & All Data
                </Button>
              ) : (
                <div className="sq-destructive-box">
                  <p style={{ fontSize: "14px", fontWeight: 800, color: "#991b1b", marginBottom: "8px" }}>
                    Are you absolutely sure?
                  </p>
                  <p style={{ fontSize: "13px", color: "var(--ink)", marginBottom: "12px", lineHeight: 1.6 }}>
                    All your saved quests, alerts, and account history will be permanently deleted from our servers immediately.
                  </p>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <Button
                      size="sm"
                      disabled={deleting}
                      className="sq-destructive-btn"
                      onClick={handleDeleteAccount}
                    >
                      {deleting ? "Deleting everything…" : "Yes, Permanently Delete My Data"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={deleting}
                      onClick={() => setShowDeleteConfirm(false)}
                      style={{ minHeight: "44px" }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <p role="alert" className="sq-auth-error mt-4">
                {error}
              </p>
            )}
          </>
        ) : (
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", marginTop: "12px" }}>
            <p style={{ color: "var(--muted-foreground)", maxWidth: "340px", fontSize: "15px" }}>
              Log in to sync your saved quests across devices and get Telegram deadline reminders.
            </p>
            <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
              <Button asChild>
                <Link href="/login?next=%2Fprofile">Log in or Sign up</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/discover">Browse Quests</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
