"use client";

import React, { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Bookmark, ArrowUpRight, CalendarDays, Copy, Check, Send } from "lucide-react";
import { useAuth } from "@/components/sidequest/auth-state";
import { useBookmarks, useCountdownClock } from "@/components/sidequest/discovery-state";
import { HackathonCard } from "@/components/sidequest/hackathon-card";
import { Mascot } from "@/components/sidequest/mascot";
import { Button } from "@/components/ui/button";
import { normalizeHackathon, type HackathonUI } from "@/lib/hackathons";
import { questGroups, questTab, type QuestTab } from "@/lib/quests";
import { getHackathons } from "@/lib/db/hackathons";
import { EmptyState } from "@/components/ui/states/EmptyState";
import { ErrorState } from "@/components/ui/states/ErrorState";

import { SEED_HACKATHONS } from "@/seed/hackathons";

function QuestLogView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = (searchParams.get("tab") as QuestTab) || "active";

  const { user, loading: authLoading } = useAuth();
  const { saved, loading: bookmarksLoading, error } = useBookmarks();
  const [allEvents, setAllEvents] = useState<HackathonUI[]>(() =>
    SEED_HACKATHONS.map(normalizeHackathon)
  );
  const [dataLoading, setDataLoading] = useState(false);
  const [calendarCopied, setCalendarCopied] = useState(false);
  const now = useCountdownClock(Date.now());

  useEffect(() => {
    let mounted = true;
    getHackathons({ limit: 100 })
      .then((res) => {
        if (!mounted) return;
        setAllEvents(res.hackathons.map(normalizeHackathon));
        setDataLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setDataLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const groups = questGroups(allEvents, saved, tab, now);
  const total = groups.reduce((sum, g) => sum + g.events.length, 0);

  const setTab = (newTab: QuestTab) => {
    router.replace(`/quest-log?tab=${newTab}`, { scroll: false });
  };

  const calendarFeedUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/calendar/user-quest-token-2026`
      : `/api/calendar/user-quest-token-2026`;

  const copyCalendarUrl = () => {
    navigator.clipboard.writeText(calendarFeedUrl);
    setCalendarCopied(true);
    setTimeout(() => setCalendarCopied(false), 2500);
  };

  return (
    <main className="sq-account-page sq-container">
      <header className="sq-quest-heading">
        <div>
          <span className="sq-eyebrow">
            <Bookmark size={15} /> Your next big things
          </span>
          <h1>
            Your Quest Log<span>.</span>
          </h1>
          <p>A little ambition, all in one place.</p>
        </div>
        <Mascot />
      </header>

      {/* Guest notice if not signed in */}
      {!authLoading && !user && (
        <div
          style={{
            background: "rgba(182, 245, 0, 0.08)",
            border: "1px dashed var(--brand)",
            borderRadius: "16px",
            padding: "12px 18px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <span style={{ fontSize: "13px" }}>
            ⚡ <strong>Saved locally in your browser.</strong> Sign in to sync across devices or enable Telegram deadline alerts.
          </span>
          <Button asChild size="sm" variant="outline">
            <Link href="/login?next=%2Fquest-log">Sign in to sync</Link>
          </Button>
        </div>
      )}

      <>
        <div className="sq-quest-tabs" role="group" aria-label="Quest timeline">
          {(["active", "upcoming", "past"] as QuestTab[]).map((value) => (
            <Button
              key={value}
              variant={tab === value ? "default" : "ghost"}
              aria-pressed={tab === value}
              onClick={() => setTab(value)}
            >
              {value}
              <span>
                {
                  allEvents.filter(
                    (e) => saved.includes(e.id) && questTab(e, now) === value
                  ).length
                }
              </span>
            </Button>
          ))}
        </div>

          {saved.length > 0 && (
            <>
              {/* Telegram Sync Banner */}
              <div
                style={{
                  background: "linear-gradient(135deg, rgba(34, 158, 217, 0.08) 0%, rgba(182, 245, 0, 0.08) 100%)",
                  border: "1.5px solid rgba(34, 158, 217, 0.35)",
                  borderRadius: "20px",
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "14px",
                  marginBottom: "20px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "10px",
                      background: "#229ED9",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      boxShadow: "0 4px 10px rgba(34, 158, 217, 0.25)",
                    }}
                  >
                    <Send size={18} />
                  </div>
                  <div>
                    <strong style={{ fontSize: "14px", display: "block", color: "var(--ink)" }}>
                      Sync your Quest Log with @SideQuestAlertsBot
                    </strong>
                    <span style={{ fontSize: "12px", color: "#475569" }}>
                      Get instant 24h & 3h Telegram pings for your {saved.length} saved {saved.length === 1 ? "quest" : "quests"}.
                    </span>
                  </div>
                </div>
                <Button asChild size="sm" style={{ background: "#229ED9", color: "#fff", fontWeight: 700 }}>
                  <a
                    href="https://t.me/SideQuestAlertsBot?start=sync_saved_quests"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Send size={14} /> Open Telegram Bot <ArrowUpRight size={14} />
                  </a>
                </Button>
              </div>

              <div className="sq-trust-strip mb-8" style={{ marginTop: 0, justifyContent: "space-between" }}>
                <span className="text-xs">
                  <CalendarDays size={14} className="inline mr-1" />
                  Live iCal Feed: Sync your quests to Google Calendar / Apple Calendar
                </span>
                <Button size="sm" variant="outline" onClick={copyCalendarUrl}>
                  {calendarCopied ? <Check size={14} /> : <Copy size={14} />}
                  {calendarCopied ? "Feed Copied!" : "Copy iCal Link"}
                </Button>
              </div>
            </>
          )}

          {error ? (
            <ErrorState
              title="Could not load your Quest Log"
              description="Your saved quests couldn't be loaded from the server right now. Try checking your internet connection or reload."
              onRetry={() => window.location.reload()}
            />
          ) : bookmarksLoading || dataLoading ? (
            <div className="py-12 text-center" role="status">
              <p className="text-muted-foreground animate-pulse">Gathering your saved quests…</p>
            </div>
          ) : total ? (
            groups
              .filter((g) => g.events.length)
              .map((group) => (
                <section key={group.title} className="sq-quest-group">
                  <h2>
                    {group.title}
                    <span>{group.events.length}</span>
                  </h2>
                  <div className="sq-event-grid">
                    {group.events.map((event) => (
                      <HackathonCard key={event.id} event={event} now={now} />
                    ))}
                  </div>
                </section>
              ))
          ) : (
            <EmptyState
              title={saved.length ? "No quests on this timeline" : "Your next quest is out there"}
              description={
                saved.length
                  ? "Check another tab for your saved hackathons, or bookmark new upcoming hackathons."
                  : "Find a hackathon that sparks an idea, save it here, and track all deadlines effortlessly."
              }
              actionLabel="Discover hackathons"
              actionHref="/discover"
            />
          )}
        </>
    </main>
  );
}

export default function QuestLogPage() {
  return (
    <Suspense fallback={<p className="sq-container py-12">Opening Quest Log…</p>}>
      <QuestLogView />
    </Suspense>
  );
}
