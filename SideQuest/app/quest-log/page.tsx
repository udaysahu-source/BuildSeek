"use client";

import React from "react";
import Link from "next/link";
import HackathonCard from "@/components/hackathon/HackathonCard";
import Mascot from "@/components/ui/Mascot";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { getUserBookmarkedHackathons, toggleBookmark } from "@/lib/db/bookmarks";
import { Hackathon, HackathonStatus } from "@/lib/types";
import {
  Bookmark,
  Calendar,
  Check,
  Copy,
  Clock,
  Compass,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export default function QuestLogPage() {
  const [items, setItems] = React.useState<
    (Hackathon & { status: HackathonStatus })[]
  >([]);
  const [loading, setLoading] = React.useState(true);
  const [copied, setCopied] = React.useState(false);

  // Demo token for calendar feed
  const calendarToken = "user-quest-token-2026";
  const calendarFeedUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/calendar/${calendarToken}`
      : `/api/calendar/${calendarToken}`;

  React.useEffect(() => {
    getUserBookmarkedHackathons().then((res) => {
      setItems(res);
      setLoading(false);
    });
  }, []);

  const handleBookmarkToggle = async (hackathonId: string) => {
    await toggleBookmark(hackathonId);
    setItems((prev) => prev.filter((item) => item.id !== hackathonId));
  };

  const handleCopyCalendar = () => {
    navigator.clipboard.writeText(calendarFeedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const closingSoon = items.filter((h) => h.status === "closing_soon");
  const openItems = items.filter((h) => h.status === "open");
  const upcomingItems = items.filter((h) => h.status === "upcoming");
  const pastItems = items.filter((h) => h.status === "closed");

  const totalPrizePool = items.reduce(
    (sum, h) => sum + (h.prize_amount_inr || 0),
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-ink pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 bg-lime text-ink border border-ink rounded">
              Your Dashboard
            </span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-ink mt-1">
            Quest Log
          </h1>
          <p className="text-xs sm:text-sm text-ink-500 mt-0.5">
            Tracked hackathons, deadlines, and live calendar feed
          </p>
        </div>

        {/* Stats Summary Pills */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="px-3.5 py-1.5 rounded-full bg-white border-2 border-ink shadow-solid-sm text-xs font-bold text-ink flex items-center gap-1.5">
            <Bookmark className="w-3.5 h-3.5 text-lime-dark" />
            <span>{items.length} Tracked</span>
          </div>
          {totalPrizePool > 0 && (
            <div className="px-3.5 py-1.5 rounded-full bg-lime text-ink border-2 border-ink shadow-solid-sm text-xs font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>₹{totalPrizePool.toLocaleString("en-IN")} Target Pool</span>
            </div>
          )}
        </div>
      </div>

      {/* Calendar Subscription Banner */}
      <div className="retro-card p-5 bg-accentBlue-soft border-2 border-ink flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white border-2 border-ink flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 text-ink" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-ink">
              Sync with Google or Apple Calendar
            </h3>
            <p className="text-xs text-ink-700">
              Auto-updating private .ics feed. Never miss a 24h deadline reminder.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <input
            type="text"
            readOnly
            value={calendarFeedUrl}
            className="flex-1 sm:w-64 px-3 py-1.5 bg-white border border-ink rounded-lg text-xs font-mono text-ink-700 select-all"
          />
          <Button
            variant="lime"
            size="sm"
            onClick={handleCopyCalendar}
            icon={copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          >
            {copied ? "Copied!" : "Copy Feed"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="py-20 text-center font-bold text-sm text-ink-500">
          Loading your Quest Log...
        </div>
      ) : items.length === 0 ? (
        <div className="retro-card p-12 text-center bg-white flex flex-col items-center justify-center space-y-4">
          <Mascot size={110} expression="sleeping" />
          <h3 className="font-display font-extrabold text-2xl text-ink">
            No Quests Saved Yet
          </h3>
          <p className="text-sm text-ink-500 max-w-sm mx-auto">
            Browse active hackathons, hit the bookmark icon on any card, and track your deadlines right here.
          </p>
          <Link href="/discover">
            <Button variant="lime" size="md" icon={<Compass className="w-4 h-4" />}>
              Explore Active Hackathons
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          {/* 1. Closing Soon Section */}
          {closingSoon.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-urgent animate-ping" />
                <h2 className="font-display font-extrabold text-xl text-ink flex items-center gap-2">
                  <span>⚡ Closing Soon (&lt; 72 Hours)</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-urgent text-white">
                    {closingSoon.length}
                  </span>
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {closingSoon.map((h) => (
                  <HackathonCard
                    key={h.id}
                    hackathon={h}
                    onBookmarkToggle={() => handleBookmarkToggle(h.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 2. Open & Active */}
          {openItems.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-display font-extrabold text-xl text-ink flex items-center gap-2">
                <span>🟢 Open for Registration</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-lime text-ink border border-ink">
                  {openItems.length}
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {openItems.map((h) => (
                  <HackathonCard
                    key={h.id}
                    hackathon={h}
                    onBookmarkToggle={() => handleBookmarkToggle(h.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 3. Upcoming */}
          {upcomingItems.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-display font-extrabold text-xl text-ink flex items-center gap-2">
                <span>⏳ Upcoming Registration</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-parchment-subtle text-ink border border-parchment-border">
                  {upcomingItems.length}
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingItems.map((h) => (
                  <HackathonCard
                    key={h.id}
                    hackathon={h}
                    onBookmarkToggle={() => handleBookmarkToggle(h.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 4. Past Quests */}
          {pastItems.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-parchment-border">
              <h2 className="font-display font-bold text-lg text-ink-500 flex items-center gap-2">
                <span>📁 Past Quests</span>
                <span className="text-xs font-mono text-ink-500">
                  ({pastItems.length})
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-75">
                {pastItems.map((h) => (
                  <HackathonCard
                    key={h.id}
                    hackathon={h}
                    onBookmarkToggle={() => handleBookmarkToggle(h.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
