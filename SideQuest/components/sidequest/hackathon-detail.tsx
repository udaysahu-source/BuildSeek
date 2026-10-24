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
  Share2,
  CheckCircle2,
  Code2,
  FileText,
  Clock,
  Sparkles,
  ShieldCheck,
  Award,
  Send,
} from "lucide-react";
import { toast } from "sonner";
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

type DetailTab = "overview" | "timeline" | "tracks" | "prizes" | "rules";

export function HackathonDetail({
  event,
  now,
  drawer = false,
}: {
  event: HackathonUI;
  now: number;
  drawer?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const [sampleNotice, setSampleNotice] = useState(false);
  const time = countdown(event, now);

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

  function handleShare() {
    if (typeof window !== "undefined") {
      const shareUrl = `${window.location.origin}/h/${event.id}`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl);
        toast.success("Quest link copied to clipboard!", {
          description: event.title,
        });
      } else {
        toast.info("Quest URL:", { description: shareUrl });
      }
    }
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
      {/* Header Banner */}
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

          {/* Scope Badge */}
          {event.scope && (
            <span
              className="sq-card-scope"
              style={{
                background: "var(--white)",
                padding: "3px 10px",
                borderRadius: "999px",
                fontSize: "11px",
                fontWeight: 600,
                textTransform: "capitalize",
              }}
            >
              {event.scope}
            </span>
          )}

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

          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            <Button
              variant="outline"
              size="icon"
              onClick={handleShare}
              title="Share this quest"
              aria-label="Share quest"
              style={{ background: "var(--white)" }}
            >
              <Share2 size={15} />
            </Button>
            <BookmarkButton event={event} />
          </div>
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
        </div>

        <h1>{event.title}</h1>
        <p style={{ fontWeight: 600 }}>{event.organizer}</p>

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
              ["seconds", time.seconds],
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

        {/* Organizer deadline note */}
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
      </header>

      {/* Main Body */}
      <div className="sq-detail-body">
        {/* Quick Facts Grid */}
        <div className="sq-detail-facts">
          <Fact icon={<Trophy />} label="Prize pool" value={prizeLabel} />
          <Fact icon={<CreditCard />} label="Entry fee" value={formatFee(event)} />
          <Fact icon={<Users />} label="Team size" value={teamLabel} />
          <Fact
            icon={<Target />}
            label="Scope"
            value={event.scope.charAt(0).toUpperCase() + event.scope.slice(1)}
          />
          <Fact icon={<CalendarDays />} label="Event dates" value={datesLabel} />
          <Fact
            icon={<GraduationCap />}
            label="Eligibility"
            value={event.eligibility_text || event.eligibility || "Not stated"}
          />
        </div>

        {/* Navigation Tabs */}
        <nav className="sq-detail-tabs" aria-label="Hackathon detail sections">
          <button
            type="button"
            className={`sq-detail-tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <FileText size={14} /> Overview
          </button>
          <button
            type="button"
            className={`sq-detail-tab-btn ${activeTab === "timeline" ? "active" : ""}`}
            onClick={() => setActiveTab("timeline")}
          >
            <Clock size={14} /> Rounds & Timeline
          </button>
          <button
            type="button"
            className={`sq-detail-tab-btn ${activeTab === "tracks" ? "active" : ""}`}
            onClick={() => setActiveTab("tracks")}
          >
            <Sparkles size={14} /> Tracks & Problems
          </button>
          <button
            type="button"
            className={`sq-detail-tab-btn ${activeTab === "prizes" ? "active" : ""}`}
            onClick={() => setActiveTab("prizes")}
          >
            <Award size={14} /> Prizes & Rewards
          </button>
          <button
            type="button"
            className={`sq-detail-tab-btn ${activeTab === "rules" ? "active" : ""}`}
            onClick={() => setActiveTab("rules")}
          >
            <ShieldCheck size={14} /> Rules & Submission
          </button>
        </nav>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <section>
            {event.summary && (
              <div className="sq-summary-callout">
                <strong>Executive Summary:</strong> {event.summary}
              </div>
            )}

            {/* Telegram Quest Reminder */}
            <div className="sq-telegram-quest-banner">
              <div className="sq-telegram-quest-icon">
                <Send size={20} />
              </div>
              <div className="sq-telegram-quest-text">
                <strong>Never miss registration closing for {event.title}</strong>
                <p>Get instant 24-hour and 3-hour deadline notifications delivered straight to your Telegram chat.</p>
              </div>
              <a
                href={`https://t.me/BuildSeekAlertsBot?start=event_${event.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="sq-telegram-quest-btn"
                title="Open in Telegram Bot"
              >
                <Send size={13} /> Remind on Telegram <ArrowUpRight size={13} />
              </a>
            </div>

            <h2>About the Hackathon</h2>
            <div className="sq-detail-markdown">
              {event.description.split("\n\n").map((block, idx) => {
                if (block.startsWith("### ")) {
                  return <h3 key={idx}>{block.replace("### ", "")}</h3>;
                }
                if (block.includes("\n• ") || block.startsWith("• ")) {
                  const items = block.split("\n").filter((l) => l.trim().length > 0);
                  return (
                    <ul key={idx}>
                      {items.map((it, i) => (
                        <li key={i}>
                          <span
                            dangerouslySetInnerHTML={{
                              __html: it
                                .replace(/^[•\-\*]\s*/, "")
                                .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
                            }}
                          />
                        </li>
                      ))}
                    </ul>
                  );
                }
                if (block.match(/^\d+\.\s/m)) {
                  const items = block.split("\n").filter((l) => l.trim().length > 0);
                  return (
                    <ol key={idx}>
                      {items.map((it, i) => (
                        <li key={i}>
                          <span
                            dangerouslySetInnerHTML={{
                              __html: it
                                .replace(/^\d+\.\s*/, "")
                                .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
                            }}
                          />
                        </li>
                      ))}
                    </ol>
                  );
                }
                return (
                  <p
                    key={idx}
                    dangerouslySetInnerHTML={{
                      __html: block.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
                    }}
                  />
                );
              })}
            </div>

            {event.venue && (
              <div style={{ marginTop: 24, marginBottom: 24 }}>
                <h2>Venue & Location</h2>
                <p>
                  📍 <strong>{event.venue}</strong>
                  {event.city ? `, ${event.city}` : ""}
                  {event.country ? ` (${event.country})` : ""}
                </p>
                <Button asChild variant="outline" size="sm" style={{ marginTop: 8 }}>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${event.venue} ${event.city || ""}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open on Google Maps <ExternalLink size={13} style={{ marginLeft: 4 }} />
                  </a>
                </Button>
              </div>
            )}

            <div style={{ marginTop: 24 }}>
              <h2>Themes & Tags</h2>
              <div className="sq-card-tags">
                {event.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Tab 2: Stages & Timeline */}
        {activeTab === "timeline" && (
          <section>
            <h2>Stages & Rounds</h2>
            <p style={{ color: "var(--muted-foreground)", fontSize: "13px", marginBottom: 20 }}>
              Key milestones, submission dates, and evaluation rounds for {event.title}.
            </p>

            <div className="sq-timeline-list">
              {(event.rounds && event.rounds.length > 0
                ? event.rounds
                : [
                    {
                      phase: 1,
                      name: "Registration & Ideation",
                      date: event.reg_deadline ? `Closes ${formatDate(event.reg_deadline)}` : "Open",
                      description: "Assemble team members, finalize idea, and register on the official portal.",
                    },
                    {
                      phase: 2,
                      name: "Prototype Building Sprint",
                      date: event.start_date ? formatDate(event.start_date) : "Sprint Phase",
                      description: "Develop working software MVP with mentor checkpoints and code reviews.",
                    },
                    {
                      phase: 3,
                      name: "Finale Demo & Pitch",
                      date: event.end_date ? formatDate(event.end_date) : "Closing Day",
                      description: "Deliver live demo to judges, explain architecture, and participate in Q&A.",
                    },
                  ]
              ).map((round, idx) => (
                <div key={idx} className="sq-timeline-card">
                  <div className="sq-timeline-phase">{round.phase || idx + 1}</div>
                  <div>
                    <h3 className="sq-timeline-title">{round.name}</h3>
                    {round.date && <span className="sq-timeline-date">{round.date}</span>}
                    <p className="sq-timeline-desc">{round.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tab 3: Tracks & Challenges */}
        {activeTab === "tracks" && (
          <section>
            <h2>Focus Tracks & Challenge Areas</h2>
            <p style={{ color: "var(--muted-foreground)", fontSize: "13px", marginBottom: 20 }}>
              Choose a track to focus your problem statement and build your solution.
            </p>

            <div className="sq-tracks-grid">
              {(event.tracks && event.tracks.length > 0
                ? event.tracks
                : [
                    {
                      name: "Open Innovation",
                      description: "Build breakthrough solutions addressing real problems with software or hardware prototypes.",
                      suggested_tech: ["Fullstack Web", "Mobile", "APIs", "Cloud"],
                    },
                  ]
              ).map((track, idx) => (
                <div key={idx} className="sq-track-card">
                  <h3>{track.name}</h3>
                  <p>{track.description}</p>
                  {track.suggested_tech && track.suggested_tech.length > 0 && (
                    <div>
                      <small style={{ display: "block", fontSize: "10px", color: "var(--muted-foreground)", marginBottom: 6, fontWeight: 700 }}>
                        RECOMMENDED TECH
                      </small>
                      <div className="sq-track-tech-row">
                        {track.suggested_tech.map((tech) => (
                          <span key={tech} className="sq-tech-badge">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tab 4: Prizes & Rewards */}
        {activeTab === "prizes" && (
          <section>
            <h2>Prizes & Winner Rewards</h2>
            <p style={{ color: "var(--muted-foreground)", fontSize: "13px", marginBottom: 20 }}>
              Recognitions, cash awards, sponsor perks, and certificates for high-impact teams.
            </p>

            <div className="sq-prizes-grid">
              {(event.prizes_breakdown && event.prizes_breakdown.length > 0
                ? event.prizes_breakdown
                : [
                    {
                      place: "Grand Prize",
                      reward: prizeLabel,
                      description: "Top performing team awarded by official judges and sponsors.",
                    },
                    {
                      place: "Participation",
                      reward: "Certificates of Participation",
                      description: "Verified certificates issued to all eligible submissions.",
                    },
                  ]
              ).map((prize, idx) => {
                const podiumClass =
                  idx === 0 ? "podium-1" : idx === 1 ? "podium-2" : idx === 2 ? "podium-3" : "";
                return (
                  <div key={idx} className={`sq-prize-card ${podiumClass}`}>
                    <div className="sq-prize-place">{prize.place}</div>
                    <div className="sq-prize-reward">{prize.reward}</div>
                    {prize.description && <p className="sq-prize-desc">{prize.description}</p>}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Tab 5: Rules & Submission */}
        {activeTab === "rules" && (
          <section>
            <h2>Submission Requirements</h2>
            <p style={{ color: "var(--muted-foreground)", fontSize: "13px", marginBottom: 20 }}>
              Ensure your project includes all required deliverables prior to deadline cutoff.
            </p>

            <div className="sq-checklist-group">
              {(event.submission_guidelines && event.submission_guidelines.length > 0
                ? event.submission_guidelines
                : [
                    "Public GitHub or GitLab repository with informative README and architecture diagram.",
                    "Recorded 3-minute video demo demonstrating the core feature workflow.",
                    "Concise slide presentation (PDF/Slides) explaining impact and scalability.",
                    "Live hosted preview link or installable release build.",
                  ]
              ).map((item, idx) => (
                <div key={idx} className="sq-checklist-card">
                  <CheckCircle2 size={18} className="sq-check-icon" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <h2 style={{ marginTop: 28 }}>Judging Criteria</h2>
            <div className="sq-criteria-grid">
              {(event.judging_criteria && event.judging_criteria.length > 0
                ? event.judging_criteria
                : [
                    { criterion: "Innovation & Creativity", weight: "30%", description: "Originality and novelty of the concept." },
                    { criterion: "Technical Depth", weight: "30%", description: "Clean code structure, engineering complexity, and stability." },
                    { criterion: "Design & UX", weight: "20%", description: "Intuitive interface and responsive styling." },
                    { criterion: "Practical Impact", weight: "20%", description: "Real-world utility and adoption potential." },
                  ]
              ).map((crit, idx) => (
                <div key={idx} className="sq-criteria-card">
                  <div className="sq-criteria-header">
                    <span className="sq-criteria-title">{crit.criterion}</span>
                    <span className="sq-criteria-weight">{crit.weight}</span>
                  </div>
                  <p className="sq-criteria-desc">{crit.description}</p>
                </div>
              ))}
            </div>

            <h2 style={{ marginTop: 28 }}>Rules & Code of Conduct</h2>
            <div className="sq-checklist-group">
              {(event.rules && event.rules.length > 0
                ? event.rules
                : [
                    `Team composition must strictly adhere to ${teamLabel}.`,
                    "All code and project assets must be created during the hackathon timeline.",
                    "Open-source packages and AI developer tooling are permitted with attribution.",
                    "Plagiarism or submission of pre-existing commercial products leads to disqualification.",
                  ]
              ).map((rule, idx) => (
                <div key={idx} className="sq-checklist-card">
                  <ShieldCheck size={18} style={{ color: "#3b82f6", flexShrink: 0, marginTop: 2 }} />
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Source & Trust Verification Footer */}
        <div className="sq-detail-source">
          <span>Source: {event.source}</span>
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

      {/* Floating Action Dock */}
      <div className="sq-detail-actions" style={{ flexWrap: "wrap", gap: 8 }}>
        {event.apply_url && (
          <Button
            asChild
            style={{ background: "var(--brand)", color: "var(--ink)", fontWeight: 700 }}
          >
            <a href={event.apply_url} target="_blank" rel="noopener noreferrer">
              Direct Apply <ArrowUpRight size={16} />
            </a>
          </Button>
        )}

        <Button
          asChild
          style={
            !event.apply_url
              ? { background: "var(--brand)", color: "var(--ink)", fontWeight: 700 }
              : undefined
          }
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
            <a href={event.official_page} target="_blank" rel="noopener noreferrer">
              Official Page <ExternalLink size={15} />
            </a>
          </Button>
        )}

        <Button
          asChild
          variant="outline"
          style={{
            borderColor: "rgba(34, 158, 217, 0.4)",
            color: "#0284c7",
            fontWeight: 700,
            background: "rgba(34, 158, 217, 0.05)",
          }}
        >
          <a
            href={`https://t.me/BuildSeekAlertsBot?start=event_${event.id}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Get 24h & 3h deadline alert on Telegram"
            aria-label={`Get Telegram alert for ${event.title}`}
          >
            <Send size={15} style={{ color: "#229ED9" }} />
            <span>Telegram Alert</span>
          </a>
        </Button>

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
          <span>.ics</span>
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
