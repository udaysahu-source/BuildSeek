"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Globe2,
  MapPin,
  Trophy,
  Users,
  GraduationCap,
  CreditCard,
  Target,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  countdown,
  formatDate,
  formatPrize,
  formatFee,
  toCalendar,
  toGoogleCalendar,
  type HackathonUI,
} from "@/lib/hackathons";
import { BookmarkButton, CountdownChip } from "./hackathon-card";

export function HackathonDetail({
  event,
  now,
  drawer = false,
}: {
  event: HackathonUI;
  now: number;
  drawer?: boolean;
}) {
  const time = countdown(event, now);
  const [sampleNotice, setSampleNotice] = useState(false);

  function downloadCalendar() {
    const icsContent = toCalendar(event);
    const url = URL.createObjectURL(
      new Blob([icsContent], { type: "text/calendar;charset=utf-8" })
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.id}.ics`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const orgLabel =
    event.organizer_type.charAt(0).toUpperCase() + event.organizer_type.slice(1);

  // Compute Prize label with original currency if present
  let prizeLabel = "Not stated";
  if (event.prize_currency && event.prize_amount) {
    prizeLabel = `${event.prize_currency} ${event.prize_amount.toLocaleString()} (₹${(
      event.prize_amount_inr || 0
    ).toLocaleString("en-IN")})`;
  } else if (event.prize_amount_inr) {
    prizeLabel = formatPrize(event.prize_amount_inr);
  } else if (event.prize_text) {
    prizeLabel = event.prize_text;
  }

  // Compute team size label
  let teamLabel = "Not stated";
  if (event.team_min && event.team_max) {
    teamLabel =
      event.team_min === event.team_max
        ? `${event.team_min} members`
        : `${event.team_min}–${event.team_max} members`;
  } else if (event.team_min) {
    teamLabel = `${event.team_min}+ members`;
  }
  if (event.team_note) {
    teamLabel += ` (${event.team_note})`;
  }

  // Compute dates label
  const datesLabel =
    event.start_date || event.end_date
      ? `${formatDate(event.start_date)} – ${formatDate(event.end_date)}`
      : "Dates not stated";

  return (
    <div className={`sq-detail ${drawer ? "sq-detail-in-drawer" : ""}`}>
      <header className="sq-detail-header">
        <div className="sq-detail-top" style={{ flexWrap: "wrap", gap: 8 }}>
          {!drawer && (
            <Button asChild variant="outline" size="icon">
              <Link href="/discover" aria-label="Back to Discover">
                <ArrowLeft />
              </Link>
            </Button>
          )}

          {/* Organizer Type Badge */}
          <span
            className={`sq-card-org-badge org-${event.organizer_type}`}
            style={{ background: "var(--white)" }}
          >
            {orgLabel}
          </span>

          {/* Fee chip */}
          <span
            className={`sq-card-fee fee-${event.fee_type}`}
            style={{ background: "var(--white)" }}
          >
            {formatFee(event)}
          </span>

          {/* Unverified badge */}
          {event.data_confidence === "unverified" && (
            <span
              className="sq-card-unverified"
              style={{ background: "#FFF3E0", borderColor: "#FF9800" }}
            >
              Check source
            </span>
          )}

          {event.is_sample && (
            <span className="sq-card-sample">Sample event</span>
          )}

          <BookmarkButton event={event} />
        </div>

        <div className="sq-card-location">
          <span>
            <Globe2 size={13} />
            {event.mode}
          </span>
          {event.city && (
            <span>
              <MapPin size={13} />
              {event.city}
              {event.state ? `, ${event.state}` : ""}
              {event.country ? ` (${event.country})` : ""}
            </span>
          )}
          {event.scope && (
            <span style={{ textTransform: "capitalize" }}>
              Scope: {event.scope}
            </span>
          )}
        </div>

        <h1>{event.title}</h1>
        <p>{event.organizer}</p>

        <CountdownChip event={event} now={now} />

        {time.hasDeadline && (
          <div
            className="sq-countdown-tiles"
            aria-label={
              time.status === "upcoming"
                ? "Registration opens in"
                : "Registration closes in"
            }
          >
            {[
              ["days", time.days],
              ["hours", time.hours],
              ["minutes", time.minutes],
            ].map(([label, value]) => (
              <div key={String(label)}>
                <strong>{String(value).padStart(2, "0")}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        )}

        <span className="sq-deadline-caption">
          {time.status === "closed"
            ? "Registration has ended"
            : !event.reg_deadline
            ? "Deadline not stated by organizer"
            : time.status === "upcoming"
            ? `Registration opens ${formatDate(event.reg_start)}`
            : `Register by ${formatDate(event.reg_deadline)}`}{" "}
          {event.reg_deadline ? "· UTC / IST" : ""}
        </span>

        {/* Prominent deadline note if provided by organizer or source */}
        {event.deadline_note && (
          <div className="sq-deadline-note-box">
            ⏰ <strong>Organizer deadline note:</strong> {event.deadline_note}
          </div>
        )}

        {/* Warning if needs review */}
        {event.needs_review && (
          <div
            className="sq-deadline-note-box"
            style={{
              background: "#FFF3E0",
              border: "1px dashed #FF9800",
              marginTop: 8,
            }}
          >
            <AlertTriangle
              size={13}
              style={{ display: "inline", marginRight: 5, verticalAlign: "text-bottom" }}
            />
            <strong>Check source:</strong> This event requires manual review or lacks structured dates. Confirm details directly on the organizer&apos;s site.
          </div>
        )}

        {/* Warning if date-only deadline */}
        {event.deadline_precision === "date" && (
          <div
            className="sq-deadline-note-box"
            style={{
              background: "#F3E5F5",
              border: "1px dashed #AB47BC",
              marginTop: 8,
            }}
          >
            📅 <strong>Date-only deadline:</strong> The source lists a cutoff date without an exact timezone or minute. Check the official page for the exact submission deadline.
          </div>
        )}

        {/* Warning if unverified row */}
        {event.data_confidence === "unverified" && (
          <div
            className="sq-deadline-note-box"
            style={{
              background: "#FFF8E1",
              border: "1px dashed #FFA000",
              marginTop: 8,
            }}
          >
            <AlertTriangle
              size={13}
              style={{ display: "inline", marginRight: 5, verticalAlign: "text-bottom" }}
            />
            <strong>Unverified listing:</strong> Dates and prize details are gathered
            from secondary sources. Always confirm rules and deadlines on the official portal
            before submitting.
          </div>
        )}
      </header>

      <div className="sq-detail-body">
        <div className="sq-detail-facts">
          <Fact
            icon={<Trophy />}
            label="Prize pool"
            value={prizeLabel}
          />
          <Fact
            icon={<CreditCard />}
            label="Entry fee"
            value={formatFee(event)}
          />
          <Fact
            icon={<Users />}
            label="Team size"
            value={teamLabel}
          />
          <Fact
            icon={<Target />}
            label="Scope"
            value={
              event.scope.charAt(0).toUpperCase() + event.scope.slice(1)
            }
          />
          <Fact
            icon={<CalendarDays />}
            label="Event dates"
            value={datesLabel}
          />
          <Fact
            icon={<GraduationCap />}
            label="Eligibility"
            value={event.eligibility_text || event.eligibility || "Not stated"}
          />
        </div>

        {event.venue && (
          <section>
            <h2>Venue & Location</h2>
            <p>
              📍 <strong>{event.venue}</strong>
              {event.city ? `, ${event.city}` : ""}
              {event.country ? ` (${event.country})` : ""}
            </p>
          </section>
        )}

        <section>
          <h2>About the hackathon</h2>
          {event.description.split("\n\n").map((p) => (
            <p key={p}>{p}</p>
          ))}
        </section>

        <section>
          <h2>Themes</h2>
          <div className="sq-card-tags">
            {event.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </section>

        <div className="sq-detail-source">
          <span>{event.source}</span>
          <span>
            {event.data_confidence === "verified_primary"
              ? "✓ Verified primary source"
              : event.data_confidence === "platform_listed"
              ? "Platform listed"
              : "Secondary / unverified"}
          </span>
          {event.last_verified_at && (
            <span>Verified: {formatDate(event.last_verified_at)}</span>
          )}
        </div>

        {sampleNotice && (
          <p role="status" className="sq-sample-registration-note">
            Redirecting to source website ({event.source_url}).
          </p>
        )}
      </div>

      <div className="sq-detail-actions" style={{ flexWrap: "wrap", gap: 8 }}>
        {event.apply_url && (
          <Button
            asChild
            style={{ background: "var(--brand)", color: "var(--ink)" }}
          >
            <a
              href={event.apply_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Direct Apply <ArrowUpRight size={16} />
            </a>
          </Button>
        )}

        <Button
          asChild
          onClick={() => {
            if (event.source_url && event.source_url !== "https://example.com") {
              window.open(event.source_url, "_blank");
            } else {
              setSampleNotice(true);
            }
          }}
        >
          <a href={event.source_url} target="_blank" rel="noopener noreferrer">
            Register on Source <ArrowUpRight size={16} />
          </a>
        </Button>

        {event.official_page && (
          <Button asChild variant="outline">
            <a
              href={event.official_page}
              target="_blank"
              rel="noopener noreferrer"
            >
              Official Page <ExternalLink size={15} />
            </a>
          </Button>
        )}

        <Button asChild variant="outline">
          <a
            href={toGoogleCalendar(event)}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in Google Calendar"
            aria-label={`Add ${event.title} to Google Calendar`}
          >
            <CalendarDays size={16} />
            <span>Google Calendar</span>
          </a>
        </Button>

        <Button
          variant="outline"
          onClick={downloadCalendar}
          aria-label={`Download .ics file for ${event.title}`}
          title="Download .ics calendar file"
        >
          <CalendarDays size={16} />
          <span>Download .ics</span>
        </Button>
      </div>
    </div>
  );
}

function Fact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <span className="sq-fact-icon">{icon}</span>
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  );
}
