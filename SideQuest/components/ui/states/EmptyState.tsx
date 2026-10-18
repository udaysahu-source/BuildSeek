import React, { ReactNode } from "react";
import Link from "next/link";
import { FolderSearch, PlusCircle, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Mascot from "@/components/ui/Mascot";

export interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  icon?: ReactNode;
  showMascot?: boolean;
}

export function EmptyState({
  title = "No Quests Found",
  description = "There are no entries to display right now. Try adjusting your filters or check back later.",
  actionText,
  actionLabel,
  actionHref,
  onAction,
  icon,
  showMascot = true,
}: EmptyStateProps) {
  const finalActionLabel = actionLabel || actionText;
  return (
    <div
      className="retro-card p-10 flex flex-col items-center justify-center text-center bg-white space-y-4 my-8"
      style={{
        border: "3px solid #0B1033",
        borderRadius: "24px",
        boxShadow: "5px 5px 0px #0B1033",
      }}
    >
      {showMascot ? (
        <Mascot size={100} expression="sleeping" />
      ) : (
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "#EAF8C8",
            border: "2px solid #0B1033",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon || <FolderSearch size={26} color="#0B1033" />}
        </div>
      )}

      <div className="space-y-1">
        <h3
          className="font-display font-extrabold text-xl text-ink"
          style={{ fontFamily: "var(--font-display, sans-serif)", color: "#0B1033" }}
        >
          {title}
        </h3>
        <p className="text-sm text-ink-500 max-w-sm mx-auto" style={{ color: "#475569" }}>
          {description}
        </p>
      </div>

      {(finalActionLabel && (actionHref || onAction)) && (
        <div style={{ marginTop: "12px" }}>
          {actionHref ? (
            <Button
              asChild
              style={{
                background: "#B6F500",
                color: "#0B1033",
                border: "2px solid #0B1033",
                boxShadow: "3px 3px 0px #0B1033",
                fontWeight: 700,
              }}
            >
              <Link href={actionHref}>
                {finalActionLabel} <ArrowUpRight size={15} />
              </Link>
            </Button>
          ) : (
            <Button
              onClick={onAction}
              style={{
                background: "#B6F500",
                color: "#0B1033",
                border: "2px solid #0B1033",
                boxShadow: "3px 3px 0px #0B1033",
                fontWeight: 700,
              }}
            >
              <PlusCircle size={15} /> {actionText}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
