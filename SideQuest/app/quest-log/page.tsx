"use client";

import React, { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Bookmark, ArrowUpRight, CalendarDays, Copy, Check } from "lucide-react";
import { useAuth } from "@/components/sidequest/auth-state";
import { useBookmarks, useCountdownClock } from "@/components/sidequest/discovery-state";
import { HackathonCard } from "@/components/sidequest/hackathon-card";
import { Mascot } from "@/components/sidequest/mascot";
import { Button } from "@/components/ui/button";
import { normalizeHackathon, type HackathonUI } from "@/lib/hackathons";
import { questGroups, questTab, type QuestTab } from "@/lib/quests";
import { getHackathons } from "@/lib/db/hackathons";

function QuestLogView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = (searchParams.get("tab") as QuestTab) || "active";

  const { user, loading: authLoading } = useAuth();
  const { saved, loading: bookmarksLoading, error } = useBookmarks();
  const [allEvents, setAllEvents] = useState<HackathonUI[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
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

      {authLoading ? (
        <p role="status">Opening your Quest Log…</p>
      ) : !user ? (
        <div className="sq-discovery-empty">
          <Mascot />
          <h2>Your quests need a home.</h2>
          <p>Log in to keep your saved hackathons together.</p>
          <Button asChild>
            <Link href="/login?next=%2Fquest-log">
              Log in or sign up <ArrowUpRight size={17} />
            </Link>
          </Button>
          <Link href="/discover" className="sq-browse-link">
            Browse hackathons
          </Link>
        </div>
      ) : (
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
          )}

          {error ? (
            <p role="alert" className="sq-auth-error">
              Your saved quests couldn’t load. Please refresh and try again.
            </p>
          ) : bookmarksLoading || dataLoading ? (
            <p role="status">Gathering your saved quests…</p>
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
            <div className="sq-discovery-empty">
              <Mascot />
              <h2>
                {saved.length
                  ? "No quests on this timeline."
                  : "Your next quest is out there."}
              </h2>
              <p>
                {saved.length
                  ? "Check another tab for your saved hackathons."
                  : "Find a hackathon that sparks an idea, and save it here."}
              </p>
              <Button asChild>
                <Link href="/discover">
                  Discover hackathons <ArrowUpRight size={17} />
                </Link>
              </Button>
            </div>
          )}
        </>
      )}
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
