"use client";

import { useState, useEffect } from "react";
import { ArrowUpRight, Bookmark, Clock3, Globe2, MapPin, Sparkles, Trophy, Users, Zap } from "lucide-react";
import { Mascot } from "./mascot";

export function PhonePreview() {
  return (
    <div className="sq-phone-scene" aria-label="Preview featuring verified hackathons with live countdowns">
      <span className="sq-orbit sq-orbit-one" />
      <span className="sq-orbit sq-orbit-two" />
      <div className="sq-float-chip sq-float-top">
        <Clock3 size={17} /> Your next big thing awaits <Sparkles size={17} />
      </div>
      <div className="sq-phone">
        <div className="sq-phone-camera" />
        <div className="sq-phone-content">
          <div className="sq-phone-brand">
            <span>
              <Zap size={15} fill="currentColor" /> sidequest.
            </span>
            <span className="sq-mini-avatar">U</span>
          </div>
          <div className="sq-phone-heading">
            Find your next<br />
            <span>main character moment.</span>
          </div>
          <div className="sq-phone-tabs">
            <span className="selected">For you</span>
            <span>Closing soon</span>
            <span>Online</span>
          </div>
          <SampleCard
            title="OpenCV AI Competition 2026"
            organizer="OpenCV, sponsored by AWS"
            prize="$20,250"
            mode="Online"
            location="Global"
            tag="Computer Vision"
            kind="build"
          />
          <SampleCard
            title="ETHIndia 2026"
            organizer="Devfolio & Ethereum Community"
            prize="₹85,00,000"
            mode="Offline"
            location="Bengaluru"
            tag="Web3"
            kind="horizon"
          />
          <div className="sq-phone-label">Verified events · Live deadlines</div>
        </div>
        <div className="sq-phone-home" />
      </div>
      <div className="sq-float-chip sq-float-deadline">
        <span className="sq-status-dot" />
        <LiveTicker targetIso="2026-10-27T06:59:00Z" fallback="11d : 14h : 38m" />
        <span>left to make your move</span>
      </div>
      <div className="sq-float-chip sq-float-saved">
        <Bookmark size={18} fill="currentColor" />
        <span>Saved. Sorted. SideQuest.</span>
      </div>
      <Mascot className="sq-hero-mascot" />
      <span className="sq-scene-spark sq-scene-spark-one">✳</span>
      <span className="sq-scene-spark sq-scene-spark-two">✦</span>
    </div>
  );
}

function LiveTicker({ targetIso, fallback }: { targetIso: string; fallback: string }) {
  const [display, setDisplay] = useState(fallback);

  useEffect(() => {
    const update = () => {
      const target = new Date(targetIso).getTime();
      const diff = target - Date.now();
      if (diff <= 0) {
        setDisplay("Closing soon");
        return;
      }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setDisplay(`${String(d).padStart(2, "0")}d : ${String(h).padStart(2, "0")}h : ${String(m).padStart(2, "0")}m : ${String(s).padStart(2, "0")}s`);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetIso]);

  return <strong>{display}</strong>;
}

function SampleCard({
  title,
  organizer,
  prize,
  mode,
  location,
  tag,
  kind,
}: {
  title: string;
  organizer: string;
  prize: string;
  mode: string;
  location: string;
  tag: string;
  kind: "build" | "horizon";
}) {
  return (
    <div className={`sq-sample-card ${kind}`}>
      <div className="sq-sample-top">
        <span className="sq-event-icon">
          {kind === "build" ? <Zap size={21} fill="currentColor" /> : <Globe2 size={22} />}
        </span>
        <span className={`sq-sample-status ${kind === "build" ? "closing" : "open"}`}>
          {kind === "build" ? "◷ Closing soon" : "● Registration open"}
        </span>
        <Bookmark size={15} />
      </div>
      <h3>{title}</h3>
      <p>{organizer}</p>
      <div className="sq-sample-meta">
        <span>
          <Globe2 size={10} /> {mode}
        </span>
        <span>
          <MapPin size={10} /> {location}
        </span>
      </div>
      <div className="sq-sample-facts">
        <span>
          <Trophy size={13} /> {prize}
        </span>
        <span>
          <Users size={13} /> 1–5 members
        </span>
      </div>
      <div className="sq-sample-bottom">
        <span>{tag}</span>
        <span>Open eligibility</span>
        <span className="sq-sample-arrow">
          <ArrowUpRight size={15} />
        </span>
      </div>
    </div>
  );
}
