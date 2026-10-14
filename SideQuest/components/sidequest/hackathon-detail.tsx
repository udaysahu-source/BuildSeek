"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, CalendarDays, Globe2, MapPin, Trophy, Users, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { countdown, formatDate, formatPrize, toCalendar, type HackathonUI } from "@/lib/hackathons";
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

  return (
    <div className={`sq-detail ${drawer ? "sq-detail-in-drawer" : ""}`}>
      <header className="sq-detail-header">
        <div className="sq-detail-top">
          {!drawer && (
            <Button asChild variant="outline" size="icon">
              <Link href="/discover" aria-label="Back to Discover">
                <ArrowLeft />
              </Link>
            </Button>
          )}
          {event.is_sample !== false && (
            <span className="sq-card-sample">Sample event</span>
          )}
          <BookmarkButton event={event} />
        </div>

        <div className="sq-card-location">
          <span>
            <Globe2 size={13} />
            {event.mode}
          </span>
          <span>
            <MapPin size={13} />
            {event.city}
          </span>
        </div>

        <h1>{event.title}</h1>
        <p>{event.organizer}</p>

        <CountdownChip event={event} now={now} />

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

        <span className="sq-deadline-caption">
          {time.status === "closed"
            ? "Registration has ended"
            : time.status === "upcoming"
            ? `Registration opens ${formatDate(event.reg_start)}`
            : `Register by ${formatDate(event.reg_deadline)}`}{" "}
          · IST
        </span>
      </header>

      <div className="sq-detail-body">
        <div className="sq-detail-facts">
          <Fact
            icon={<Trophy />}
            label="Prize pool"
            value={formatPrize(event.prize_amount_inr)}
          />
          <Fact
            icon={<Users />}
            label="Team size"
            value={`${event.team_min}–${event.team_max} members`}
          />
          <Fact
            icon={<CalendarDays />}
            label="Event dates"
            value={`${formatDate(event.start_date)} – ${formatDate(event.end_date)}`}
          />
          <Fact
            icon={<GraduationCap />}
            label="Eligibility"
            value={event.eligibility}
          />
        </div>

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
          <span>{event.is_sample !== false ? "Sample listing · Simulated registration" : "Verified listing"}</span>
        </div>

        {sampleNotice && (
          <p role="status" className="sq-sample-registration-note">
            Redirecting to source website ({event.source_url}).
          </p>
        )}
      </div>

      <div className="sq-detail-actions">
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
            Register on source site <ArrowUpRight size={16} />
          </a>
        </Button>
        <Button
          variant="outline"
          onClick={downloadCalendar}
          aria-label={`Add ${event.title} to calendar`}
        >
          <CalendarDays size={16} />
          <span>Add to calendar</span>
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
