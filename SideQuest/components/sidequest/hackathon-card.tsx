"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Bookmark,
  Clock3,
  Globe2,
  MapPin,
  Trophy,
  Users,
  Zap,
  AlertCircle,
  CalendarDays,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  countdown,
  formatPrize,
  formatFee,
  getStatus,
  statusLabel,
  toGoogleCalendar,
  type HackathonUI,
} from "@/lib/hackathons";
import { useBookmarks } from "./discovery-state";

export function CountdownChip({
  event,
  now,
}: {
  event: HackathonUI;
  now: number;
}) {
  const isNeedsReview = Boolean(event.needs_review || !event.reg_deadline);
  const time = countdown(event, now);
  const today = !isNeedsReview && statusLabel(event, now) === "Closes today";

  return (
    <div className={`sq-countdown-chip ${isNeedsReview ? "needs-review" : today ? "today" : time.status}`}>
      {isNeedsReview ? <AlertCircle size={13} /> : <Clock3 size={13} />}
      <span>{statusLabel(event, now)}</span>
      {!isNeedsReview && time.status !== "closed" && time.hasDeadline && (
        <strong>
          {time.days}d {String(time.hours).padStart(2, "0")}h{" "}
          {String(time.minutes).padStart(2, "0")}m{" "}
          {String(time.seconds).padStart(2, "0")}s
        </strong>
      )}
    </div>
  );
}

export function BookmarkButton({ event }: { event: HackathonUI }) {
  const { saved, toggle, pending, loading } = useBookmarks();
  const active = saved.includes(event.id);
  const [justToggled, setJustToggled] = useState(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Haptic feedback for touch devices
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(active ? 15 : [20, 35, 20]);
      } catch (err) {}
    }

    setJustToggled(true);
    setTimeout(() => setJustToggled(false), 500);

    toggle(event.id);

    if (!active) {
      toast.success("Saved to your Quest Log! (+50 XP)", {
        description: event.title,
      });
    } else {
      toast.info("Removed from Quest Log", {
        description: event.title,
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={loading || pending.includes(event.id)}
      aria-label={`${active ? "Unsave" : "Save"} ${event.title}`}
      aria-pressed={active}
      title={active ? "Remove from Quest Log" : "Save to Quest Log"}
      className={`sq-bookmark ${active ? "saved" : ""} ${justToggled ? "pop" : ""}`}
      onClick={handleToggle}
    >
      <Bookmark fill={active ? "currentColor" : "none"} />
    </Button>
  );
}

export function HackathonCard({
  event,
  now,
  onOpen,
}: {
  event: HackathonUI;
  now: number;
  onOpen?: (id: string) => void;
}) {
  const status = getStatus(event, now);

  const handleClick = (e: React.MouseEvent) => {
    if (
      onOpen &&
      !e.metaKey &&
      !e.ctrlKey &&
      !e.shiftKey &&
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 1024px)").matches
    ) {
      e.preventDefault();
      onOpen(event.id);
    }
  };

  const orgLabel =
    event.organizer_type.charAt(0).toUpperCase() + event.organizer_type.slice(1);

  return (
    <article className={`sq-event-card status-${status}`}>
      <div className="sq-card-top" style={{ flexWrap: "wrap", gap: 6 }}>
        <span className="sq-card-event-icon">
          <Zap size={23} fill="currentColor" />
        </span>

        {/* Organizer Type Badge */}
        <span
          className={`sq-card-org-badge org-${event.organizer_type}`}
          title={`Organized by ${orgLabel}`}
        >
          {orgLabel}
        </span>

        {/* Fee chip when known */}
        {event.fee_type !== "unknown" ? (
          <span className={`sq-card-fee fee-${event.fee_type}`}>
            {formatFee(event)}
          </span>
        ) : (
          <span className="sq-card-fee fee-unknown">Fee not stated</span>
        )}

        {/* Unverified "Check source" badge */}
        {event.data_confidence === "unverified" && (
          <span
            className="sq-card-unverified"
            title="Data from secondary source; confirm in official portal"
          >
            <AlertCircle size={10} style={{ display: "inline", marginRight: 3 }} />
            Check source
          </span>
        )}

        {event.is_sample && <span className="sq-card-sample">Sample</span>}

        <BookmarkButton event={event} />
      </div>

      <CountdownChip event={event} now={now} />

      <div className="sq-card-location">
        <span>
          <Globe2 size={12} />
          {event.mode}
        </span>
        {event.city && (
          <span>
            <MapPin size={12} />
            {event.city}
          </span>
        )}
        {event.scope && event.scope !== "global" && (
          <span style={{ textTransform: "capitalize" }}>
            {event.scope}
            {event.scope_assumed ? " (assumed)" : ""}
          </span>
        )}
      </div>

      <h2>
        <Link href={`/h/${event.id}`} onClick={handleClick}>
          {event.title}
        </Link>
      </h2>
      <p className="sq-card-organizer">{event.organizer}</p>

      <div className="sq-card-facts">
        <div>
          <Trophy size={17} />
          <span>
            <small>Prize pool</small>
            <strong>
              {event.prize_amount_inr
                ? formatPrize(event.prize_amount_inr)
                : event.prize_text || "Not stated"}
            </strong>
          </span>
        </div>
        <div>
          <Users size={17} />
          <span>
            <small>Team size</small>
            <strong>
              {event.team_min && event.team_max
                ? event.team_min === event.team_max
                  ? `${event.team_min} members`
                  : `${event.team_min}–${event.team_max} members`
                : event.team_min
                ? `${event.team_min}+ members`
                : "Not stated"}
            </strong>
          </span>
        </div>
      </div>

      <div className="sq-card-tags">
        {event.tags.slice(0, 3).map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>

      <div className="sq-card-footer" style={{ gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontWeight: 600, fontSize: "11px", textTransform: "capitalize" }}>
            {event.source}
          </span>
          <a
            href={toGoogleCalendar(event)}
            target="_blank"
            rel="noopener noreferrer"
            title="Add deadline to Google Calendar"
            aria-label="Add deadline to Google Calendar"
            style={{ display: "inline-flex", alignItems: "center", color: "var(--muted-foreground)", padding: "2px" }}
          >
            <CalendarDays size={13} />
          </a>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
          <Button asChild variant="outline" size="sm" style={{ height: "32px", fontSize: "12px", padding: "0 10px" }}>
            <Link
              href={`/h/${event.id}`}
              onClick={handleClick}
              title="View full hackathon details"
            >
              Details
            </Link>
          </Button>

          <Button asChild size="sm" style={{ height: "32px", fontSize: "12px", padding: "0 12px" }}>
            <a
              href={event.apply_url || event.official_page || event.source_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Register for ${event.title}`}
            >
              Register <ArrowUpRight size={13} style={{ marginLeft: 3 }} />
            </a>
          </Button>
        </div>
      </div>
    </article>
  );
}
