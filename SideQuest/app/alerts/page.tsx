"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  Clock3,
  Copy,
  CalendarDays,
  Send,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Play,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function AlertsPage() {
  const [calendarCopied, setCalendarCopied] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [testSent, setTestSent] = useState(false);

  // Preference toggles as specified:
  // 1. 24h before close for saved events
  // 2. 3h before close for saved events
  // 3. New events matching my interests
  const [prefs, setPrefs] = useState({
    remind24h: true,
    remind3h: true,
    matchingInterests: true,
  });

  const togglePref = (key: keyof typeof prefs) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      toast.success("Alert preferences updated!");
      return next;
    });
  };

  const calendarFeedUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/calendar/user-quest-token-2026`
      : `/api/calendar/user-quest-token-2026`;

  const copyCalendarUrl = () => {
    navigator.clipboard.writeText(calendarFeedUrl);
    setCalendarCopied(true);
    setTimeout(() => setCalendarCopied(false), 2500);
    toast.success("iCal subscription URL copied to clipboard!");
  };

  const handleTestMessage = () => {
    setTestSending(true);
    setTestSent(false);

    setTimeout(() => {
      setTestSending(false);
      setTestSent(true);
      toast.success("Test alert dispatched via @BuildSeekAlertsBot!", {
        description: "Check Telegram for the test deadline reminder.",
      });
    }, 600);
  };

  return (
    <main className="sq-departure-board-container" style={{ maxWidth: "860px" }}>
      {/* Header Banner */}
      <section className="sq-board-header-banner" aria-label="Alerts & Reminders Banner">
        <div className="sq-board-header-top">
          <span className="sq-board-station-tag">
            <Bell size={15} /> Automated Radar Dispatch
          </span>
          <span className="sq-board-live-indicator">
            <span className="sq-live-pulse-green" aria-hidden="true" />
            @BuildSeekAlertsBot active
          </span>
        </div>

        <h1 className="sq-board-title">Deadline Alerts &amp; Calendar</h1>
        <p className="sq-board-subtitle">
          Never miss a registration window again. Connect Telegram for high-priority deadline pings and subscribe to live calendar feeds.
        </p>
      </section>

      {/* Main Grid: Telegram Connection & Sample Alert */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Telegram Direct Connect Card */}
        <section className="sq-departure-row p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#229ED9] text-white flex items-center justify-center border-2 border-navy shadow-[2px_2px_0_#0F1B33]">
                <Send size={18} />
              </div>
              <div>
                <h2 className="font-display font-extrabold text-xl text-navy">
                  Connect Telegram Bot
                </h2>
                <span className="text-xs text-muted-foreground font-semibold">
                  Zero setup • Direct 1-tap link
                </span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed mb-4 font-medium">
              Get automated reminders sent directly to your phone via <strong>@BuildSeekAlertsBot</strong> before your saved hackathons close.
            </p>

            <ol className="text-xs text-navy space-y-2 mb-6 pl-4 list-decimal font-semibold">
              <li>Tap the button below to open Telegram</li>
              <li>Press <strong>Start</strong> in @BuildSeekAlertsBot</li>
              <li>Receive automated pings 24h &amp; 3h before deadlines</li>
            </ol>
          </div>

          <div className="space-y-3">
            <Button
              asChild
              className="w-full bg-[#229ED9] hover:bg-[#1C88BD] text-white font-bold rounded-full border-2 border-navy shadow-[2px_2px_0_#0F1B33] min-h-[46px]"
            >
              <a
                href="https://t.me/BuildSeekAlertsBot?start=web_connect"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Send size={16} /> Open @BuildSeekAlertsBot
              </a>
            </Button>

            <Button
              variant="outline"
              onClick={handleTestMessage}
              disabled={testSending}
              className="w-full border-2 border-navy text-navy font-bold rounded-full shadow-[2px_2px_0_#0F1B33] text-xs min-h-[42px]"
            >
              {testSending ? (
                <span>Dispatching test ping…</span>
              ) : testSent ? (
                <span className="inline-flex items-center gap-1.5 text-boardGreen font-bold">
                  <CheckCircle2 size={14} /> Test Ping Sent to Telegram
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <Play size={13} /> Send Test Message
                </span>
              )}
            </Button>
          </div>
        </section>

        {/* Telegram Message Preview Card */}
        <section className="bg-navy text-white p-6 rounded-2xl border-2 border-navy shadow-[4px_4px_0_#0F1B33] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-gray-400 mb-3 pb-2 border-b border-white/10">
              <span className="flex items-center gap-1.5 font-mono">
                <span className="sq-live-pulse-green" aria-hidden="true" />
                TELEGRAM BOT PREVIEW
              </span>
              <span className="text-signal-yellow font-bold">@BuildSeekAlertsBot</span>
            </div>

            <div className="bg-[#14223E] border-2 border-signal-yellow/40 rounded-xl p-4 text-xs font-mono space-y-2">
              <div className="text-signal-yellow font-bold text-sm">
                ⏰ REGISTRATION CLOSING IN 24H
              </div>
              <div className="text-white font-bold text-base font-sans">
                OpenCV AI Competition 2026
              </div>
              <div className="text-gray-300 space-y-1">
                <div>📍 Mode: Online • Global</div>
                <div>🏆 Prize Pool: ₹17,21,250 ($20,250)</div>
                <div className="text-coral-navy font-bold">
                  ⏳ Closes: Tomorrow, 11:59 PM IST
                </div>
              </div>
              <div className="pt-2">
                <span className="inline-block bg-brand text-navy font-bold px-3 py-1 rounded-full border border-navy text-xs">
                  Apply on Source &rarr;
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-4">
            No spam or marketing broadcasts. Strictly deadline warnings and curated alerts matching your skills.
          </p>
        </section>
      </div>

      {/* Reminder Configuration Options */}
      <section className="sq-departure-row p-6 mb-8">
        <h2 className="font-display font-extrabold text-2xl text-navy mb-1">
          Notification Preferences
        </h2>
        <p className="text-xs text-muted-foreground font-medium mb-5">
          Choose which deadline triggers send reminders to your connected Telegram.
        </p>

        <div className="space-y-4">
          <label className="sq-toggle-row p-3 rounded-md hover:bg-gray-50 border border-transparent hover:border-gray-200">
            <div className="sq-toggle-info">
              <span className="sq-toggle-title">
                <Clock3 size={16} className="text-coral" />
                24 Hours Before Close (Saved Events)
              </span>
              <span className="sq-toggle-sub">
                Primary heads-up warning giving you one final day to submit your team or deck.
              </span>
            </div>
            <input
              type="checkbox"
              checked={prefs.remind24h}
              onChange={() => togglePref("remind24h")}
              className="sq-switch"
              aria-label="Toggle 24-hour reminder"
            />
          </label>

          <label className="sq-toggle-row p-3 rounded-md hover:bg-gray-50 border border-transparent hover:border-gray-200">
            <div className="sq-toggle-info">
              <span className="sq-toggle-title">
                <Clock3 size={16} className="text-coral" />
                3 Hours Before Close (Saved Events)
              </span>
              <span className="sq-toggle-sub">
                Last-call urgent ping before the portal locks registration.
              </span>
            </div>
            <input
              type="checkbox"
              checked={prefs.remind3h}
              onChange={() => togglePref("remind3h")}
              className="sq-switch"
              aria-label="Toggle 3-hour reminder"
            />
          </label>

          <label className="sq-toggle-row p-3 rounded-md hover:bg-gray-50 border border-transparent hover:border-gray-200">
            <div className="sq-toggle-info">
              <span className="sq-toggle-title">
                <Sparkles size={16} className="text-signal-yellow" />
                New Events Matching My Interests
              </span>
              <span className="sq-toggle-sub">
                Alerts when new hackathons matching your selected tech stacks are published.
              </span>
            </div>
            <input
              type="checkbox"
              checked={prefs.matchingInterests}
              onChange={() => togglePref("matchingInterests")}
              className="sq-switch"
              aria-label="Toggle matching interests reminder"
            />
          </label>
        </div>
      </section>

      {/* Calendar Subscription Feed Card */}
      <section className="sq-departure-row p-6" style={{ borderRadius: "10px" }}>
        <div className="flex items-center gap-3 mb-2">
          <CalendarDays size={20} className="text-navy" />
          <h2 className="font-condensed font-extrabold text-2xl uppercase tracking-wide text-navy">
            Live Calendar Feed (iCal)
          </h2>
        </div>
        <p className="text-xs text-mutedText mb-4">
          Subscribe once in Apple Calendar, Google Calendar, or Outlook to automatically sync all your saved hackathon deadlines.
        </p>

        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            readOnly
            value={calendarFeedUrl}
            className="flex-1 p-2.5 bg-gray-50 border border-gray-300 rounded font-mono text-xs text-gray-700 select-all"
            aria-label="iCal calendar feed URL"
          />
          <Button
            type="button"
            onClick={copyCalendarUrl}
            className="bg-navy text-signal-yellow font-condensed font-bold uppercase tracking-wider shrink-0 min-h-[44px]"
          >
            {calendarCopied ? <Check size={14} /> : <Copy size={14} />}
            <span>{calendarCopied ? "Copied!" : "Copy Link"}</span>
          </Button>
        </div>

        <div className="p-3 bg-gray-50 rounded border border-gray-200 text-xs text-mutedText space-y-1">
          <strong>How to subscribe:</strong>
          <div>• <strong>Apple Calendar:</strong> File &rarr; New Calendar Subscription &rarr; Paste link</div>
          <div>• <strong>Google Calendar:</strong> Other Calendars (+) &rarr; From URL &rarr; Paste link</div>
        </div>
      </section>
    </main>
  );
}
