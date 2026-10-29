"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { AlertCircle, Clock3, ChevronRight, Zap } from "lucide-react";
import { useBookmarks, useCountdownClock } from "./discovery-state";
import { countdown, getStatus, type HackathonUI } from "@/lib/hackathons";
import { getHackathons, getLocalDataset } from "@/lib/db/hackathons";

export function NextDeadlineStrip() {
  const { saved } = useBookmarks();
  const now = useCountdownClock(Date.now());
  const [allEvents, setAllEvents] = useState<HackathonUI[]>(() =>
    getLocalDataset() as unknown as HackathonUI[]
  );

  useEffect(() => {
    let mounted = true;
    getHackathons({ limit: 100 })
      .then((res) => {
        if (!mounted) return;
        setAllEvents(res.hackathons as unknown as HackathonUI[]);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const nearest = useMemo(() => {
    if (!saved || saved.length === 0) return null;

    const savedEvents = allEvents.filter((e) => saved.includes(e.id));
    const activeSaved = savedEvents.filter((e) => {
      if (!e.reg_deadline) return false;
      const dl = Date.parse(e.reg_deadline);
      return !isNaN(dl) && dl > now;
    });

    if (activeSaved.length === 0) return null;

    activeSaved.sort((a, b) => {
      const aTime = a.reg_deadline ? Date.parse(a.reg_deadline) : Infinity;
      const bTime = b.reg_deadline ? Date.parse(b.reg_deadline) : Infinity;
      return aTime - bTime;
    });

    return activeSaved[0];
  }, [saved, allEvents, now]);

  if (!nearest) return null;

  const time = countdown(nearest, now);
  const status = getStatus(nearest, now);
  const isClosingSoon = status === "closing-soon";

  return (
    <aside
      aria-label="Next Saved Deadline Banner"
      className="sq-next-deadline-strip"
    >
      <div className="sq-next-deadline-inner">
        <div className="sq-next-deadline-left">
          <span
            className={`sq-next-deadline-pill ${
              isClosingSoon ? "is-closing" : "is-open"
            }`}
          >
            <span className="sq-live-pulse-dot" aria-hidden="true" />
            {isClosingSoon ? "Closing soon" : "Next departure"}
          </span>

          <span className="sq-next-deadline-title">
            <strong>{nearest.title}</strong>
            <span className="sq-next-deadline-org">
              • {nearest.organizer}
            </span>
          </span>
        </div>

        <div className="sq-next-deadline-right">
          <div
            className={`sq-next-deadline-clock ${
              isClosingSoon ? "is-closing" : "is-open"
            }`}
          >
            <Clock3 size={14} className="shrink-0" />
            <span className="tabular-nums font-mono font-bold tracking-wider">
              {time.days}d {String(time.hours).padStart(2, "0")}h{" "}
              {String(time.minutes).padStart(2, "0")}m{" "}
              {String(time.seconds).padStart(2, "0")}s
            </span>
          </div>

          <Link
            href={`/h/${nearest.id}`}
            className="sq-next-deadline-cta"
            title={`View ${nearest.title}`}
          >
            <span>View event</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </aside>
  );
}
