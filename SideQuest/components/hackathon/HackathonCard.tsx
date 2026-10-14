"use client";

import React from "react";
import Link from "next/link";
import { Bookmark, Users, Sparkles, ExternalLink } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export interface HackathonCardData {
  id: string;
  title: string;
  organizer: string;
  source: string;
  source_url: string;
  mode: "online" | "offline" | "hybrid";
  city?: string | null;
  reg_deadline: string; // ISO date
  start_date: string;
  prize_text?: string | null;
  prize_amount_inr?: number | null;
  team_min?: number | null;
  team_max?: number | null;
  tags?: string[];
  is_bookmarked?: boolean;
}

interface HackathonCardProps {
  hackathon: HackathonCardData;
  onBookmarkToggle?: (id: string, e: React.MouseEvent) => void;
  className?: string;
}

export const HackathonCard: React.FC<HackathonCardProps> = ({
  hackathon,
  onBookmarkToggle,
  className,
}) => {
  const [bookmarked, setBookmarked] = React.useState(
    hackathon.is_bookmarked || false
  );

  // Compute status & countdown
  const now = new Date();
  const deadline = new Date(hackathon.reg_deadline);
  const diffMs = deadline.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  const isClosed = diffMs <= 0;
  const isClosingSoon = !isClosed && diffHours <= 72;

  let countdownText = "";
  if (isClosed) {
    countdownText = "Registration closed";
  } else if (diffHours < 24) {
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    countdownText = `Ends in ${diffHours}h ${mins}m`;
  } else if (diffDays === 1) {
    countdownText = "Ends tomorrow";
  } else {
    countdownText = `${diffDays} days left`;
  }

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarked(!bookmarked);
    if (onBookmarkToggle) {
      onBookmarkToggle(hackathon.id, e);
    }
  };

  const formattedPrize =
    hackathon.prize_amount_inr && hackathon.prize_amount_inr > 0
      ? `₹${hackathon.prize_amount_inr.toLocaleString("en-IN")}`
      : hackathon.prize_text || "Trophy & Swag";

  const teamSizeText =
    hackathon.team_min && hackathon.team_max
      ? hackathon.team_min === hackathon.team_max
        ? `${hackathon.team_min} members`
        : `${hackathon.team_min}-${hackathon.team_max} members`
      : "1-4 members";

  return (
    <article
      className={cn(
        "retro-card retro-card-hover p-4 sm:p-5 flex flex-col justify-between group relative bg-white",
        isClosingSoon && "border-urgent shadow-[3px_3px_0px_#C62F3A]",
        className
      )}
    >
      <div>
        {/* Header row: Source + Mode + Bookmark */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-500 bg-parchment-subtle px-2 py-0.5 rounded-full border border-parchment-border">
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
          </div>

          <button
            onClick={handleBookmark}
            aria-label={bookmarked ? "Remove bookmark" : "Add to bookmarks"}
            className={cn(
              "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
              bookmarked
                ? "bg-lime border-ink text-ink shadow-[1px_1px_0px_#0B1033]"
                : "bg-white border-ink/30 text-ink/40 hover:text-ink hover:border-ink"
            )}
          >
            <Bookmark
              className={cn("w-4 h-4", bookmarked ? "fill-ink stroke-ink" : "stroke-current")}
            />
          </button>
        </div>

        {/* Title & Organizer */}
        <Link href={`/h/${hackathon.id}`} className="block group-hover:text-ink-800">
          <h3 className="font-display font-extrabold text-lg sm:text-xl text-ink leading-snug mb-1 group-hover:underline decoration-lime decoration-2 underline-offset-2">
            {hackathon.title}
          </h3>
          <p className="text-xs font-medium text-ink-500 mb-3">
            by {hackathon.organizer}
          </p>
        </Link>

        {/* Countdown / Status banner */}
        <div className="mb-4">
          <Badge
            variant={
              isClosed
                ? "status-closed"
                : isClosingSoon
                ? "status-closing"
                : "status-open"
            }
          >
            {countdownText}
          </Badge>
        </div>
      </div>

      <div>
        {/* Prize & Team Size stats */}
        <div className="grid grid-cols-2 gap-2 py-2.5 px-3 bg-parchment/60 rounded-xl border border-parchment-border mb-3 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-ink">
            <Sparkles className="w-3.5 h-3.5 text-lime-dark shrink-0" />
            <span className="truncate">{formattedPrize}</span>
          </div>
          <div className="flex items-center gap-1.5 text-ink-700">
            <Users className="w-3.5 h-3.5 text-ink-500 shrink-0" />
            <span className="truncate">{teamSizeText}</span>
          </div>
        </div>

        {/* Tags footer & Source Link */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-parchment-border/80">
          <div className="flex flex-wrap gap-1 overflow-hidden max-h-6">
            {(hackathon.tags || []).slice(0, 2).map((tag) => (
              <Badge key={tag} variant="tag" className="text-[10px] py-0 px-2">
                #{tag}
              </Badge>
            ))}
          </div>

          <a
            href={hackathon.source_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-xs font-bold text-ink flex items-center gap-1 hover:text-lime-dark shrink-0 ml-auto"
          >
            <span>Register</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </article>
  );
};

export default HackathonCard;
