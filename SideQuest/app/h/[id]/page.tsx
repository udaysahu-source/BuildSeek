import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getHackathonById } from "@/lib/db/hackathons";
import { formatDeadlineCountdown } from "@/lib/status";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import {
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  MapPin,
  Sparkles,
  Users,
  ShieldCheck,
  Bookmark,
  Share2,
} from "lucide-react";

interface DetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function HackathonDetailPage({ params }: DetailPageProps) {
  const { id } = await params;
  const hackathon = await getHackathonById(id);

  if (!hackathon) {
    notFound();
  }

  const countdown = formatDeadlineCountdown(hackathon.reg_deadline);

  const formattedPrize =
    hackathon.prize_amount_inr && hackathon.prize_amount_inr > 0
      ? `₹${hackathon.prize_amount_inr.toLocaleString("en-IN")}`
      : hackathon.prize_text || "Prizes & Recognition";

  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-24 md:pb-12">
      {/* Back button */}
      <div>
        <Link
          href="/discover"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-500 hover:text-ink transition-colors px-3 py-1.5 rounded-full border border-parchment-border bg-white shadow-solid-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to all hackathons</span>
        </Link>
      </div>

      {/* Main Detail Header Card */}
      <div className="retro-card p-6 sm:p-8 bg-white space-y-6">
        {/* Source & Mode Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-500 bg-parchment-subtle px-2.5 py-1 rounded-full border border-parchment-border">
              {hackathon.source}
            </span>
            <Badge
              variant={
                hackathon.mode === "online"
                  ? "mode-online"
                  : hackathon.mode === "offline"
                  ? "mode-offline"
                  : "mode-hybrid"
              }
            >
              {hackathon.mode === "offline" && hackathon.city
                ? hackathon.city
                : hackathon.mode}
            </Badge>
            {hackathon.verified && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-lime-dark bg-lime-light px-2.5 py-0.5 rounded-full border border-lime-dark">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" icon={<Bookmark className="w-4 h-4" />}>
              Save
            </Button>
          </div>
        </div>

        {/* Title & Organizer */}
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-ink leading-tight">
            {hackathon.title}
          </h1>
          <p className="text-sm font-semibold text-ink-500 mt-1">
            Organized by <span className="text-ink font-bold">{hackathon.organizer}</span>
          </p>
        </div>

        {/* Live Countdown & Urgency Box */}
        <div
          className={`p-4 sm:p-5 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            countdown.isClosingSoon
              ? "bg-urgent-light border-urgent shadow-[3px_3px_0px_#C62F3A]"
              : countdown.isClosed
              ? "bg-gray-100 border-gray-400"
              : "bg-parchment border-ink shadow-solid-sm"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full border-2 border-ink flex items-center justify-center shrink-0 ${
                countdown.isClosingSoon ? "bg-urgent text-white" : "bg-lime text-ink"
              }`}
            >
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-ink-500">
                Registration Deadline
              </p>
              <p className="text-sm sm:text-base font-extrabold text-ink">
                {formatDate(hackathon.reg_deadline)}
              </p>
            </div>
          </div>

          <Badge
            variant={
              countdown.isClosed
                ? "status-closed"
                : countdown.isClosingSoon
                ? "status-closing"
                : "status-open"
            }
            className="text-sm py-1 px-3 self-start sm:self-auto"
          >
            {countdown.label}
          </Badge>
        </div>

        {/* 3 Stats Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-4 rounded-xl bg-parchment/60 border border-parchment-border">
            <div className="flex items-center gap-2 text-ink-500 text-xs font-bold uppercase">
              <Sparkles className="w-4 h-4 text-lime-dark" />
              <span>Prize Pool</span>
            </div>
            <p className="font-display font-extrabold text-xl text-ink mt-1">
              {formattedPrize}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-parchment/60 border border-parchment-border">
            <div className="flex items-center gap-2 text-ink-500 text-xs font-bold uppercase">
              <Users className="w-4 h-4 text-ink" />
              <span>Team Size</span>
            </div>
            <p className="font-display font-extrabold text-xl text-ink mt-1">
              {hackathon.team_min === hackathon.team_max
                ? `${hackathon.team_min} Hacker`
                : `${hackathon.team_min} - ${hackathon.team_max} Hackers`}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-parchment/60 border border-parchment-border">
            <div className="flex items-center gap-2 text-ink-500 text-xs font-bold uppercase">
              <Calendar className="w-4 h-4 text-ink" />
              <span>Event Runtime</span>
            </div>
            <p className="font-display font-extrabold text-sm text-ink mt-1 truncate">
              {new Date(hackathon.start_date).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
              })}{" "}
              –{" "}
              {new Date(hackathon.end_date).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
              })}
            </p>
          </div>
        </div>

        {/* AI Summary / Fast Overview */}
        {hackathon.summary && (
          <div className="p-4 rounded-xl bg-lime-light border border-lime-dark">
            <div className="flex items-center gap-1.5 text-xs font-bold text-lime-dark uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Quick Student Overview</span>
            </div>
            <p className="text-sm font-semibold text-ink leading-relaxed">
              {hackathon.summary}
            </p>
          </div>
        )}

        {/* Full Description */}
        <div className="space-y-2 pt-2 border-t border-parchment-border">
          <h2 className="font-display font-bold text-lg text-ink">About the Hackathon</h2>
          <p className="text-sm text-ink-700 leading-relaxed whitespace-pre-line">
            {hackathon.description || hackathon.summary}
          </p>
        </div>

        {/* Eligibility Details */}
        <div className="space-y-2 pt-2 border-t border-parchment-border">
          <h2 className="font-display font-bold text-lg text-ink">Eligibility & Rules</h2>
          <ul className="text-sm text-ink-700 space-y-1.5 list-disc list-inside">
            <li>
              <span className="font-bold">Student Verification:</span>{" "}
              {hackathon.eligibility.students_only
                ? "Enrolled college / university students only"
                : "Open to working professionals & students"}
            </li>
            <li>
              <span className="font-bold">Team Composition:</span>{" "}
              Between {hackathon.team_min} and {hackathon.team_max} members allowed per team
            </li>
            {hackathon.city && (
              <li>
                <span className="font-bold">Location Venue:</span> {hackathon.city},{" "}
                {hackathon.state || "India"}
              </li>
            )}
          </ul>
        </div>

        {/* Tags */}
        <div className="space-y-2 pt-2 border-t border-parchment-border">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink-500">
            Tags & Domains
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {hackathon.tags.map((tag) => (
              <Badge key={tag} variant="tag">
                #{tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Bottom CTA on Desktop */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t-2 border-ink">
          <span className="text-xs text-ink-500 font-medium">
            Registrations are handled directly on {hackathon.source}.
          </span>
          <a
            href={hackathon.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <Button
              variant="lime"
              size="lg"
              className="w-full sm:w-auto"
              icon={<ExternalLink className="w-4 h-4" />}
            >
              Register on {hackathon.source}
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
