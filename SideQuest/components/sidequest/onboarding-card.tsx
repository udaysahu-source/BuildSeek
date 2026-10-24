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
    <div className="sq-onboarding-banner">
      <button
        onClick={handleDismiss}
        aria-label="Dismiss starter quest guide"
        title="Hide starter quest"
        className="sq-onboarding-dismiss"
      >
        <X size={18} />
      </button>

      <div className="sq-onboarding-grid">
        <div className="sq-onboarding-main">
          <div className="sq-onboarding-top">
            <span className="sq-onboarding-badge">
              <Sparkles size={11} /> Starter Quest
            </span>
            <span className="sq-onboarding-status">
              {completedCount === 3
                ? "🎉 Quest Completed!"
                : `${completedCount} of 3 steps completed (${progressPercent}%)`}
            </span>
          </div>

          <h2 className="sq-onboarding-title">
            New to BuildSeek? Here’s your 60-second jumpstart.
          </h2>
          <p className="sq-onboarding-desc">
            Find the right collegiate hackathon, bookmark your targets, and get automated Telegram reminders before deadlines expire.
          </p>

          {/* Progress bar */}
          <div className="sq-onboarding-progress-track">
            <div
              className="sq-onboarding-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Interactive Steps */}
          <div className="sq-onboarding-steps">
            {/* Step 1 */}
            <div className={`sq-onboarding-step ${step1 ? "is-complete" : ""}`}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="sq-onboarding-step-num">
                  {step1 ? <Check size={13} strokeWidth={3} /> : "1"}
                </span>
                <strong style={{ fontSize: "13px" }}>Filter by interest</strong>
              </div>
              <p style={{ fontSize: "12px", color: "var(--muted-foreground)", margin: 0 }}>
                {step1 ? (
                  <span style={{ color: "#166534", fontWeight: 700 }}>Active filter applied!</span>
                ) : (
                  <span>
                    Try clicking{" "}
                    <button
                      type="button"
                      onClick={() => onFilterPreset?.("AI")}
                      className="sq-onboarding-btn-link"
                    >
                      AI
                    </button>{" "}
                    or{" "}
                    <button
                      type="button"
                      onClick={() => onFilterPreset?.("Web3")}
                      className="sq-onboarding-btn-link"
                    >
                      Web3
                    </button>
                  </span>
                )}
              </p>
            </div>

            {/* Step 2 */}
            <div className={`sq-onboarding-step ${step2 ? "is-complete" : ""}`}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="sq-onboarding-step-num">
                  {step2 ? <Check size={13} strokeWidth={3} /> : "2"}
                </span>
                <strong style={{ fontSize: "13px" }}>Bookmark an event</strong>
              </div>
              <p style={{ fontSize: "12px", color: "var(--muted-foreground)", margin: 0 }}>
                {step2 ? (
                  <span style={{ color: "#166534", fontWeight: 700 }}>
                    {savedCount} {savedCount === 1 ? "quest" : "quests"} saved in Quest Log!
                  </span>
                ) : (
                  "Tap the bookmark icon on any hackathon card below."
                )}
              </p>
            </div>

            {/* Step 3 */}
            <div className={`sq-onboarding-step ${step3 ? "is-complete" : ""}`}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="sq-onboarding-step-num">
                  {step3 ? <Check size={13} strokeWidth={3} /> : "3"}
                </span>
                <strong style={{ fontSize: "13px" }}>Enable Deadline Radar</strong>
              </div>
              <p style={{ fontSize: "12px", color: "var(--muted-foreground)", margin: 0 }}>
                {step3 ? (
                  <span style={{ color: "#166534", fontWeight: 700 }}>Radar active!</span>
                ) : (
                  <a
                    href="https://t.me/BuildSeekAlertsBot"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleSyncClick}
                    style={{ textDecoration: "underline", fontWeight: 700, color: "#0284c7" }}
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
            style={{ fontSize: "12px", minHeight: "44px" }}
          >
            Don’t show again
          </Button>
        </div>
      </div>
    </div>
  );
}
