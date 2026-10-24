"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Sparkles, X, Bookmark, Send, Filter, Trophy, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/sidequest/mascot";

interface OnboardingCardProps {
  savedCount: number;
  hasActiveFilters: boolean;
  onFilterPreset?: (tag: string) => void;
}

export function OnboardingCard({
  savedCount,
  hasActiveFilters,
  onFilterPreset,
}: OnboardingCardProps) {
  const [dismissed, setDismissed] = useState(true);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDismissed = localStorage.getItem("sidequest_onboarding_dismissed_v1");
      if (!isDismissed) {
        setDismissed(false);
      }
      const isSynced = localStorage.getItem("sidequest_telegram_synced_v1");
      if (isSynced) {
        setSynced(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("sidequest_onboarding_dismissed_v1", "true");
    }
  };

  const handleSyncClick = () => {
    setSynced(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("sidequest_telegram_synced_v1", "true");
    }
  };

  if (dismissed) return null;

  const step1 = hasActiveFilters;
  const step2 = savedCount > 0;
  const step3 = synced;
  const completedCount = [step1, step2, step3].filter(Boolean).length;
  const progressPercent = Math.round((completedCount / 3) * 100);

  return (
    <div
      className="sq-onboarding-banner"
      style={{
        background: "linear-gradient(135deg, rgba(182, 245, 0, 0.12) 0%, rgba(34, 158, 217, 0.08) 100%)",
        border: "2.5px solid var(--border)",
        boxShadow: "5px 5px 0 var(--border)",
        borderRadius: "22px",
        padding: "24px 28px",
        marginBottom: "28px",
        position: "relative",
      }}
    >
      <button
        onClick={handleDismiss}
        aria-label="Dismiss starter quest guide"
        title="Hide starter quest"
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "6px",
          borderRadius: "8px",
          color: "var(--muted-foreground)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        className="hover:bg-black/5 dark:hover:bg-white/10"
      >
        <X size={18} />
      </button>

      <div style={{ display: "flex", alignItems: "flex-start", gap: "20px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "260px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <span
              style={{
                background: "var(--brand)",
                color: "#0B1033",
                fontWeight: 800,
                fontSize: "11px",
                padding: "3px 8px",
                borderRadius: "999px",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                textTransform: "uppercase",
              }}
            >
              <Sparkles size={11} /> Starter Quest
            </span>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink)" }}>
              {completedCount === 3
                ? "🎉 Quest Completed!"
                : `${completedCount} of 3 steps completed (${progressPercent}%)`}
            </span>
          </div>

          <h2 style={{ fontSize: "22px", fontWeight: 800, lineHeight: 1.25, margin: "0 0 6px" }}>
            New to BuildSeek? Here’s your 60-second jumpstart.
          </h2>
          <p style={{ fontSize: "14px", color: "var(--muted-foreground)", margin: "0 0 18px", maxWidth: "560px" }}>
            Find the right collegiate hackathon, bookmark your targets, and get automated Telegram reminders before deadlines expire.
          </p>

          {/* Progress bar */}
          <div
            style={{
              width: "100%",
              maxWidth: "460px",
              height: "6px",
              background: "rgba(0, 0, 0, 0.08)",
              borderRadius: "999px",
              overflow: "hidden",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: "100%",
                background: "var(--brand)",
                transition: "width 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            />
          </div>

          {/* Interactive Steps */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
            {/* Step 1 */}
            <div
              style={{
                background: step1 ? "rgba(182, 245, 0, 0.18)" : "var(--card)",
                border: step1 ? "1.5px solid var(--brand)" : "1px solid var(--border)",
                borderRadius: "14px",
                padding: "12px 14px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    background: step1 ? "var(--brand)" : "var(--muted)",
                    color: step1 ? "#0B1033" : "var(--muted-foreground)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: 800,
                  }}
                >
                  {step1 ? <Check size={13} strokeWidth={3} /> : "1"}
                </span>
                <strong style={{ fontSize: "13px" }}>Filter by interest</strong>
              </div>
              <p style={{ fontSize: "12px", color: "var(--muted-foreground)", margin: 0 }}>
                {step1 ? (
                  <span style={{ color: "var(--brand-dark, #3b7c00)", fontWeight: 600 }}>Active filter applied!</span>
                ) : (
                  <span>
                    Try clicking{" "}
                    <button
                      type="button"
                      onClick={() => onFilterPreset?.("AI")}
                      style={{ textDecoration: "underline", fontWeight: 700, color: "var(--ink)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    >
                      AI
                    </button>{" "}
                    or{" "}
                    <button
                      type="button"
                      onClick={() => onFilterPreset?.("Web3")}
                      style={{ textDecoration: "underline", fontWeight: 700, color: "var(--ink)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    >
                      Web3
                    </button>
                  </span>
                )}
              </p>
            </div>

            {/* Step 2 */}
            <div
              style={{
                background: step2 ? "rgba(182, 245, 0, 0.18)" : "var(--card)",
                border: step2 ? "1.5px solid var(--brand)" : "1px solid var(--border)",
                borderRadius: "14px",
                padding: "12px 14px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    background: step2 ? "var(--brand)" : "var(--muted)",
                    color: step2 ? "#0B1033" : "var(--muted-foreground)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: 800,
                  }}
                >
                  {step2 ? <Check size={13} strokeWidth={3} /> : "2"}
                </span>
                <strong style={{ fontSize: "13px" }}>Bookmark an event</strong>
              </div>
              <p style={{ fontSize: "12px", color: "var(--muted-foreground)", margin: 0 }}>
                {step2 ? (
                  <span style={{ color: "var(--brand-dark, #3b7c00)", fontWeight: 600 }}>
                    {savedCount} {savedCount === 1 ? "quest" : "quests"} saved in Quest Log!
                  </span>
                ) : (
                  "Tap the bookmark icon on any hackathon card below."
                )}
              </p>
            </div>

            {/* Step 3 */}
            <div
              style={{
                background: step3 ? "rgba(182, 245, 0, 0.18)" : "var(--card)",
                border: step3 ? "1.5px solid var(--brand)" : "1px solid var(--border)",
                borderRadius: "14px",
                padding: "12px 14px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    background: step3 ? "var(--brand)" : "var(--muted)",
                    color: step3 ? "#0B1033" : "var(--muted-foreground)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: 800,
                  }}
                >
                  {step3 ? <Check size={13} strokeWidth={3} /> : "3"}
                </span>
                <strong style={{ fontSize: "13px" }}>Enable Deadline Radar</strong>
              </div>
              <p style={{ fontSize: "12px", color: "var(--muted-foreground)", margin: 0 }}>
                {step3 ? (
                  <span style={{ color: "var(--brand-dark, #3b7c00)", fontWeight: 600 }}>Radar active!</span>
                ) : (
                  <a
                    href="https://t.me/BuildSeekAlertsBot"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleSyncClick}
                    style={{ textDecoration: "underline", fontWeight: 700, color: "#229ED9" }}
                  >
                    Open @BuildSeekAlertsBot <ArrowRight size={11} className="inline" />
                  </a>
                )}
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", marginLeft: "auto" }}>
          <Mascot className="w-20 h-20" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            style={{ fontSize: "12px", height: "28px" }}
          >
            Don’t show again
          </Button>
        </div>
      </div>
    </div>
  );
}
