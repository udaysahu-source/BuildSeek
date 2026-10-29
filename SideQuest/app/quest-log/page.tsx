"use client";

import React, { Suspense, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Bookmark,
  CalendarDays,
  Copy,
  Check,
  Send,
  Trash2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Edit3,
  ExternalLink,
  Clock3,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/sidequest/auth-state";
import { useBookmarks, useCountdownClock } from "@/components/sidequest/discovery-state";
import { Button } from "@/components/ui/button";
import {
  countdown,
  cleanPrizeText,
  getStatus,
  statusLabel,
  toGoogleCalendar,
  type HackathonUI,
  normalizeHackathon,
} from "@/lib/hackathons";
import { getHackathons, getLocalDataset } from "@/lib/db/hackathons";

function QuestLogView() {
  const { user, loading: authLoading } = useAuth();
  const { saved, toggle } = useBookmarks();
  const [allEvents, setAllEvents] = useState<HackathonUI[]>(() =>
    getLocalDataset().map(normalizeHackathon)
  );
  const [calendarCopied, setCalendarCopied] = useState(false);
  const [pastCollapsed, setPastCollapsed] = useState(true);

  // Registered state persisted locally in browser
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);
  // Notes per event persisted locally
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState("");

  const now = useCountdownClock(Date.now());

  // Load registered & notes from localStorage
  useEffect(() => {
    try {
      const reg = localStorage.getItem("buildseek_registered_ids");
      if (reg) setRegisteredIds(JSON.parse(reg));
      const savedNotes = localStorage.getItem("buildseek_quest_notes");
      if (savedNotes) setNotes(JSON.parse(savedNotes));
    } catch {}
  }, []);

  // Sync back to localStorage
  const toggleRegistered = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = registeredIds.includes(id)
      ? registeredIds.filter((item) => item !== id)
      : [...registeredIds, id];
    setRegisteredIds(next);
    try {
      localStorage.setItem("buildseek_registered_ids", JSON.stringify(next));
    } catch {}
    toast.success(
      next.includes(id) ? "Marked as Registered! 🚀" : "Unmarked registration"
    );
  };

  const handleSaveNote = (id: string) => {
    const next = { ...notes, [id]: noteInput };
    setNotes(next);
    try {
      localStorage.setItem("buildseek_quest_notes", JSON.stringify(next));
    } catch {}
    setEditingNoteId(null);
    setNoteInput("");
    toast.success("Note saved!");
  };

  useEffect(() => {
    let mounted = true;
    getHackathons({ limit: 100, include_closed: true })
      .then((res) => {
        if (!mounted) return;
        setAllEvents(res.hackathons.map(normalizeHackathon));
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

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

  // Group saved events into: Closing Soon, Open, Registered, Past
  const savedEvents = useMemo(() => {
    return allEvents.filter((e) => saved.includes(e.id));
  }, [allEvents, saved]);

  const groups = useMemo(() => {
    const closingSoon: HackathonUI[] = [];
    const open: HackathonUI[] = [];
    const registered: HackathonUI[] = [];
    const past: HackathonUI[] = [];

    savedEvents.forEach((ev) => {
      const isReg = registeredIds.includes(ev.id);
      const st = getStatus(ev, now);

      if (isReg) {
        registered.push(ev);
      } else if (st === "closed") {
        past.push(ev);
      } else if (st === "closing-soon") {
        closingSoon.push(ev);
      } else {
        open.push(ev);
      }
    });

    const sortByDeadline = (a: HackathonUI, b: HackathonUI) => {
      const aDl = a.reg_deadline ? Date.parse(a.reg_deadline) : Infinity;
      const bDl = b.reg_deadline ? Date.parse(b.reg_deadline) : Infinity;
      return aDl - bDl;
    };

    return {
      closingSoon: closingSoon.sort(sortByDeadline),
      open: open.sort(sortByDeadline),
      registered: registered.sort(sortByDeadline),
      past: past.sort((a, b) => {
        const aDl = a.reg_deadline ? Date.parse(a.reg_deadline) : 0;
        const bDl = b.reg_deadline ? Date.parse(b.reg_deadline) : 0;
        return bDl - aDl; // most recent past first
      }),
    };
  }, [savedEvents, registeredIds, now]);

  return (
    <main className="sq-departure-board-container">
      {/* Header Banner */}
      <section className="sq-board-header-banner" aria-label="Quest Log Banner">
        <div className="sq-board-header-top">
          <span className="sq-board-station-tag">
            <Bookmark size={15} /> Personal Departure Log
          </span>
          <span className="text-sm text-gray-300">
            {saved.length} {saved.length === 1 ? "event" : "events"} tracked
          </span>
        </div>

        <h1 className="sq-board-title">Your Quest Log</h1>
        <p className="sq-board-subtitle">
          Your saved hackathons sorted by deadline urgency with status tracking, personal notes, and automatic calendar sync.
        </p>

        {/* Calendar Sync Bar */}
        <div className="sq-quest-calendar-strip mt-4">
          <div className="flex items-center gap-2 text-sm text-gray-200">
            <CalendarDays size={16} className="text-signal-yellow" />
            <span>Sync saved deadlines with Apple Calendar or Google Calendar</span>
          </div>
          <button
            type="button"
            onClick={copyCalendarUrl}
            className="sq-quest-ical-btn"
            title="Copy iCal subscription link"
          >
            {calendarCopied ? <Check size={14} /> : <Copy size={14} />}
            <span>{calendarCopied ? "Feed Copied" : "Copy iCal Feed"}</span>
          </button>
        </div>
      </section>

      {/* Guest Notice */}
      {!authLoading && !user && (
        <div className="sq-quest-guest-banner mb-6">
          <span>
            Saved in this browser. Sign in to sync your Quest Log across laptop and phone.
          </span>
          <Button asChild size="sm" variant="outline">
            <Link href="/login?next=%2Fquest-log">Sign in to sync</Link>
          </Button>
        </div>
      )}

      {saved.length === 0 ? (
        <div className="sq-actionable-empty-state">
          <div className="sq-empty-board-icon" aria-hidden="true">
            <Bookmark size={32} />
          </div>
          <h2 className="sq-empty-board-heading">Your Quest Log is empty</h2>
          <p className="sq-empty-board-sub">
            You haven&apos;t saved any hackathons yet. Browse upcoming departures and tap the Save button to start tracking deadlines.
          </p>
          <Button asChild className="sq-empty-reset-btn">
            <Link href="/discover">Browse Departures</Link>
          </Button>
        </div>
      ) : (
        <div className="sq-quest-sections space-y-8">
          {/* 1. Closing Soon Group */}
          {groups.closingSoon.length > 0 && (
            <section aria-label="Closing soon hackathons">
              <div className="sq-quest-group-heading border-coral">
                <span className="sq-live-pulse-coral mr-2" aria-hidden="true" />
                <h2 className="text-xl font-condensed font-extrabold uppercase tracking-wide text-coral">
                  Closing Soon ({groups.closingSoon.length})
                </h2>
                <span className="text-xs text-muted-foreground ml-auto">
                  Less than 72 hours remaining
                </span>
              </div>

              <div className="space-y-3 mt-3">
                {groups.closingSoon.map((event) => (
                  <QuestLogRow
                    key={event.id}
                    event={event}
                    now={now}
                    isRegistered={registeredIds.includes(event.id)}
                    note={notes[event.id]}
                    onToggleRegistered={(e) => toggleRegistered(event.id, e)}
                    onRemove={() => toggle(event.id)}
                    onEditNote={() => {
                      setEditingNoteId(event.id);
                      setNoteInput(notes[event.id] || "");
                    }}
                  />
                ))}
              </div>
            </section>
          )}

          {/* 2. Open Group */}
          {groups.open.length > 0 && (
            <section aria-label="Open hackathons">
              <div className="sq-quest-group-heading border-boardGreen">
                <span className="sq-live-pulse-green mr-2" aria-hidden="true" />
                <h2 className="text-xl font-condensed font-extrabold uppercase tracking-wide text-boardGreen">
                  Registration Open ({groups.open.length})
                </h2>
              </div>

              <div className="space-y-3 mt-3">
                {groups.open.map((event) => (
                  <QuestLogRow
                    key={event.id}
                    event={event}
                    now={now}
                    isRegistered={registeredIds.includes(event.id)}
                    note={notes[event.id]}
                    onToggleRegistered={(e) => toggleRegistered(event.id, e)}
                    onRemove={() => toggle(event.id)}
                    onEditNote={() => {
                      setEditingNoteId(event.id);
                      setNoteInput(notes[event.id] || "");
                    }}
                  />
                ))}
              </div>
            </section>
          )}

          {/* 3. Registered Group */}
          {groups.registered.length > 0 && (
            <section aria-label="Registered hackathons">
              <div className="sq-quest-group-heading border-navy">
                <CheckCircle2 size={18} className="text-boardGreen mr-2" />
                <h2 className="text-xl font-condensed font-extrabold uppercase tracking-wide text-navy">
                  Registered ({groups.registered.length})
                </h2>
              </div>

              <div className="space-y-3 mt-3">
                {groups.registered.map((event) => (
                  <QuestLogRow
                    key={event.id}
                    event={event}
                    now={now}
                    isRegistered={true}
                    note={notes[event.id]}
                    onToggleRegistered={(e) => toggleRegistered(event.id, e)}
                    onRemove={() => toggle(event.id)}
                    onEditNote={() => {
                      setEditingNoteId(event.id);
                      setNoteInput(notes[event.id] || "");
                    }}
                  />
                ))}
              </div>
            </section>
          )}

          {/* 4. Past Group (Collapsible) */}
          {groups.past.length > 0 && (
            <section aria-label="Past hackathons" className="sq-quest-past-section">
              <button
                type="button"
                onClick={() => setPastCollapsed(!pastCollapsed)}
                className="sq-quest-past-toggle w-full"
                aria-expanded={!pastCollapsed}
              >
                <div className="flex items-center gap-2">
                  {pastCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                  <span className="font-condensed font-extrabold text-lg uppercase tracking-wide">
                    Past Deadlines ({groups.past.length})
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {pastCollapsed ? "Click to view" : "Click to collapse"}
                </span>
              </button>

              {!pastCollapsed && (
                <div className="space-y-3 mt-3">
                  {groups.past.map((event) => (
                    <QuestLogRow
                      key={event.id}
                      event={event}
                      now={now}
                      isRegistered={registeredIds.includes(event.id)}
                      note={notes[event.id]}
                      isPast={true}
                      onToggleRegistered={(e) => toggleRegistered(event.id, e)}
                      onRemove={() => toggle(event.id)}
                      onEditNote={() => {
                        setEditingNoteId(event.id);
                        setNoteInput(notes[event.id] || "");
                      }}
                    />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      )}

      {/* Note Editor Modal */}
      {editingNoteId && (
        <div
          className="sq-sheet-backdrop"
          onClick={() => setEditingNoteId(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Add builder note"
        >
          <div
            className="sq-bottom-sheet p-6"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "480px", borderRadius: "14px" }}
          >
            <h3 className="font-condensed font-extrabold text-xl uppercase mb-2">
              Builder Note
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Save team members, idea brainstorming links, or submission requirements.
            </p>

            <textarea
              className="w-full p-3 border border-gray-300 rounded-md text-sm min-h-[110px] focus:outline-navy"
              placeholder="e.g. Formed team with Ananya; submitting Agentic AI project; link to github repo..."
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              autoFocus
            />

            <div className="flex justify-end gap-3 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingNoteId(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => handleSaveNote(editingNoteId)}
                className="bg-navy text-signal-yellow"
              >
                Save Note
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function QuestLogRow({
  event,
  now,
  isRegistered,
  note,
  isPast = false,
  onToggleRegistered,
  onRemove,
  onEditNote,
}: {
  event: HackathonUI;
  now: number;
  isRegistered: boolean;
  note?: string;
  isPast?: boolean;
  onToggleRegistered: (e: React.MouseEvent) => void;
  onRemove: () => void;
  onEditNote: () => void;
}) {
  const time = countdown(event, now);
  const status = getStatus(event, now);
  const isClosingSoon = status === "closing-soon" && !isPast;
  const label = statusLabel(event, now);

  return (
    <article
      className={`sq-quest-row ${isPast ? "is-past" : ""} ${
        isClosingSoon ? "border-t-4 border-coral" : "border-t-4 border-navy"
      }`}
    >
      <div className="sq-quest-row-top flex flex-wrap items-center justify-between gap-3">
        {/* Urgency Pill & Clock */}
        <div className="flex items-center gap-3">
          <span
            className={`sq-departure-badge ${
              isPast
                ? "bg-gray-100 text-gray-600"
                : isClosingSoon
                ? "is-closing"
                : "is-open"
            }`}
          >
            <Clock3 size={13} />
            <span>{isPast ? "Deadline passed" : label}</span>
          </span>

          {!isPast && time.hasDeadline && time.status !== "closed" && (
            <span className="tabular-nums font-mono font-bold text-sm">
              {time.days}d {String(time.hours).padStart(2, "0")}h{" "}
              {String(time.minutes).padStart(2, "0")}m{" "}
              <span className="text-muted-foreground">
                {String(time.seconds).padStart(2, "0")}s
              </span>
            </span>
          )}
        </div>

        {/* Registered checkbox & Remove */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleRegistered}
            className={`sq-quest-reg-toggle ${
              isRegistered ? "is-registered" : ""
            }`}
            aria-pressed={isRegistered}
            title={isRegistered ? "Registered" : "Mark as registered"}
          >
            <Check size={14} />
            <span>{isRegistered ? "Registered" : "Mark Registered"}</span>
          </button>

          <button
            type="button"
            onClick={onRemove}
            className="sq-quest-remove-btn"
            title="Remove from Quest Log"
            aria-label={`Remove ${event.title}`}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Main Info */}
      <div className="my-2">
        <h3 className="font-condensed font-extrabold text-xl text-navy">
          <Link href={`/h/${event.id}`} className="hover:underline">
            {event.title}
          </Link>
        </h3>
        <p className="text-sm text-mutedText">
          By {event.organizer} • {event.mode} {event.city ? `(${event.city})` : ""} • Prize: {cleanPrizeText(event)}
        </p>
      </div>

      {/* Builder Note preview if present */}
      {note && (
        <div className="sq-quest-note-card">
          <Edit3 size={14} className="text-signal-yellow mt-0.5 shrink-0" />
          <p className="text-xs text-navy font-medium flex-1">{note}</p>
          <button
            type="button"
            onClick={onEditNote}
            className="text-xs text-mutedText hover:underline shrink-0"
          >
            Edit
          </button>
        </div>
      )}

      {/* Action Row */}
      <div className="sq-quest-row-actions flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2">
          {!note && (
            <button
              type="button"
              onClick={onEditNote}
              className="sq-quest-add-note-btn"
            >
              <Plus size={13} />
              <span>Add Note</span>
            </button>
          )}

          <a
            href={toGoogleCalendar(event)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-mutedText hover:underline inline-flex items-center gap-1"
          >
            <CalendarDays size={13} /> Add to Calendar
          </a>

          <a
            href={`https://t.me/BuildSeekAlertsBot?start=event_${event.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-sky-600 hover:underline inline-flex items-center gap-1"
          >
            <Send size={12} /> Telegram Alert
          </a>
        </div>

        <a
          href={event.apply_url || event.official_page || event.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="sq-quest-apply-btn"
        >
          <span>{isRegistered ? "View Application" : "Apply Now"}</span>
          <ExternalLink size={13} />
        </a>
      </div>
    </article>
  );
}

export default function QuestLogPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading Quest Log…</div>}>
      <QuestLogView />
    </Suspense>
  );
}
