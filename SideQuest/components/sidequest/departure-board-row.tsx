"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  Clock3,
  Globe2,
  MapPin,
  Trophy,
  Users,
  AlertCircle,
  CalendarDays,
  Send,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  countdown,
  cleanPrizeText,
  formatFee,
  getStatus,
  statusLabel,
  toGoogleCalendar,
  type HackathonUI,
} from "@/lib/hackathons";
import { useBookmarks } from "./discovery-state";
import { useAuth } from "./auth-state";

export function DepartureSaveButton({
  event,
  compact = false,
}: {
  event: HackathonUI;
  compact?: boolean;
}) {
  const { saved, toggle, pending, loading } = useBookmarks();
  const active = saved.includes(event.id);
  const [justToggled, setJustToggled] = useState(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(active ? 15 : [20, 30, 20]);
      } catch {}
    }

    setJustToggled(true);
    setTimeout(() => setJustToggled(false), 450);

    toggle(event.id);

    if (!active) {
      toast.success("Saved to Quest Log", {
        description: `We'll remind you before ${event.title} closes registration.`,
      });
    } else {
      toast.info("Removed from Quest Log", {
        description: event.title,
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading || pending.includes(event.id)}
      aria-label={`${active ? "Remove" : "Save"} ${event.title} to Quest Log`}
      aria-pressed={active}
      title={active ? "Saved in Quest Log" : "Save to Quest Log"}
      className={`sq-departure-save-btn ${active ? "is-saved" : ""} ${
        justToggled ? "is-pop" : ""
      } ${compact ? "is-compact" : ""}`}
    >
      <Bookmark
        size={18}
        fill={active ? "currentColor" : "none"}
        className="shrink-0"
      />
      {!compact && <span>{active ? "Saved" : "Save"}</span>}
    </button>
  );
}

export function DepartureBoardRow({
  event,
  now,
  matchScore,
  onOpenDetail,
}: {
  event: HackathonUI;
  now: number;
  matchScore?: number | null;
  onOpenDetail?: (id: string) => void;
}) {
  const time = countdown(event, now);
  const status = getStatus(event, now);
  const isClosingSoon = status === "closing-soon";
  const label = statusLabel(event, now);

  const handleClickRow = (e: React.MouseEvent) => {
    // If desktop modal handler provided and not clicking a button/link
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a")) return;
    if (onOpenDetail && typeof window !== "undefined" && window.innerWidth >= 1024) {
      onOpenDetail(event.id);
    }
  };

  const prizeDisplay = cleanPrizeText(event);

  return (
    <article
      onClick={handleClickRow}
      className={`sq-departure-row ${isClosingSoon ? "is-closing-soon" : "is-open"}`}
      aria-label={`${event.title} departure row`}
    >
      {/* 4px Navy/Urgency Rule Accent on Left/Top handled in CSS */}
      <div className="sq-departure-inner">
        {/* Departure Time & Urgency Header */}
        <div className="sq-departure-timing">
          <div
            className={`sq-departure-badge ${
              isClosingSoon ? "is-closing" : "is-open"
            }`}
          >
            <span
              className={isClosingSoon ? "sq-live-pulse-coral" : "sq-live-pulse-green"}
              aria-hidden="true"
            />
            <Clock3 size={13} className="shrink-0" />
            <span className="sq-departure-badge-text font-bold">
              {label}
            </span>
          </div>

          {time.hasDeadline && time.status !== "closed" && (
            <div
              className={`sq-departure-countdown tabular-nums font-mono ${
                isClosingSoon ? "text-coral" : "text-navy"
              }`}
              title="Time until registration closes"
            >
              <strong>{time.days}d</strong> {String(time.hours).padStart(2, "0")}h{" "}
              {String(time.minutes).padStart(2, "0")}m{" "}
              <span className="sq-departure-seconds">
                {String(time.seconds).padStart(2, "0")}s
              </span>
            </div>
          )}

          {matchScore !== undefined && matchScore !== null && matchScore > 0 && (
            <div
              className="sq-match-score-pill"
              title="Skill & preference match percentage"
            >
              <Sparkles size={11} className="text-signal-yellow" />
              <span>{matchScore}% Match</span>
            </div>
          )}
        </div>

        {/* Main Event Information */}
        <div className="sq-departure-main">
          <div className="sq-departure-title-row">
            <h3 className="sq-departure-title">
              <Link href={`/h/${event.id}`}>
                {event.title}
              </Link>
            </h3>
          </div>

          <p className="sq-departure-organizer">
            <span>By {event.organizer}</span>
            <span className="sq-departure-dot">•</span>
            <span className="sq-departure-source uppercase tracking-wider text-xs">
              via {event.source}
            </span>
          </p>

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="sq-departure-tags">
              {event.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="sq-departure-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Location & Team Meta */}
        <div className="sq-departure-meta">
          <div className="sq-fact-item">
            {event.mode === "online" ? (
              <Globe2 size={14} className="shrink-0" />
            ) : (
              <MapPin size={14} className="shrink-0" />
            )}
            <span className="capitalize font-medium">
              {event.mode}
              {event.city ? ` (${event.city})` : ""}
            </span>
          </div>

          <div className="sq-fact-item text-xs text-muted-foreground">
            <Users size={14} className="shrink-0" />
            <span>
              {event.team_min && event.team_max
                ? event.team_min === event.team_max
                  ? `${event.team_min} members`
                  : `${event.team_min}–${event.team_max} members`
                : event.team_min
                ? `${event.team_min}+ members`
                : "Any team size"}
            </span>
          </div>
        </div>

        {/* Prize Pool & Fee */}
        <div className="sq-departure-prize">
          <div className="sq-fact-item sq-fact-prize">
            <Trophy size={14} className="shrink-0 text-amber-500" />
            <strong className="font-condensed text-base tracking-wide text-navy">
              {prizeDisplay}
            </strong>
          </div>

          {event.fee_type === "free" && (
            <span className="sq-free-badge">Free</span>
          )}
        </div>

        {/* Actions Column: 1-Tap Save, Calendar, Register */}
        <div className="sq-departure-actions">
          <DepartureSaveButton event={event} />

          <div className="sq-departure-quick-icons">
            <a
              href={toGoogleCalendar(event)}
              target="_blank"
              rel="noopener noreferrer"
              title="Add deadline to Calendar"
              aria-label="Add deadline to Calendar"
              className="sq-quick-action-link"
            >
              <CalendarDays size={16} />
            </a>

            <a
              href={`https://t.me/BuildSeekAlertsBot?start=event_${event.id}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Get reminder via @BuildSeekAlertsBot"
              aria-label="Telegram reminder"
              className="sq-quick-action-link telegram"
            >
              <Send size={15} />
            </a>
          </div>

          <a
            href={event.apply_url || event.official_page || event.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="sq-departure-register-btn"
            aria-label={`Register for ${event.title}`}
          >
            <span>Register</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>
    </article>
  );
}
