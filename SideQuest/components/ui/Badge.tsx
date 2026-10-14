import React from "react";
import { cn } from "@/lib/utils";
import { Clock, Globe, MapPin, Sparkles, CheckCircle2 } from "lucide-react";

export type BadgeVariant =
  | "mode-online"
  | "mode-offline"
  | "mode-hybrid"
  | "status-closing"
  | "status-open"
  | "status-upcoming"
  | "status-closed"
  | "tag"
  | "prize";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "tag",
  icon,
  children,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "mode-online":
        return "bg-accentBlue-soft text-ink border border-accentBlue-flag";
      case "mode-offline":
        return "bg-warning-light text-ink border border-warning";
      case "mode-hybrid":
        return "bg-purple-100 text-purple-900 border border-purple-300";
      case "status-closing":
        return "bg-urgent-light text-urgent border-2 border-urgent font-bold animate-pulse";
      case "status-open":
        return "bg-lime-light text-lime-dark border-2 border-lime-dark font-bold";
      case "status-upcoming":
        return "bg-blue-50 text-blue-800 border border-blue-300 font-medium";
      case "status-closed":
        return "bg-gray-100 text-gray-600 border border-gray-300 line-through";
      case "prize":
        return "bg-lime text-ink font-bold border border-ink shadow-[1px_1px_0px_#0B1033]";
      case "tag":
      default:
        return "bg-parchment-subtle text-ink-700 border border-parchment-border hover:bg-gray-200 transition-colors";
    }
  };

  const getDefaultIcon = () => {
    if (icon) return icon;
    switch (variant) {
      case "mode-online":
        return <Globe className="w-3 h-3 shrink-0" />;
      case "mode-offline":
        return <MapPin className="w-3 h-3 shrink-0" />;
      case "status-closing":
        return <Clock className="w-3 h-3 shrink-0 text-urgent" />;
      case "status-open":
        return <CheckCircle2 className="w-3 h-3 shrink-0 text-lime-dark" />;
      case "prize":
        return <Sparkles className="w-3 h-3 shrink-0 text-ink" />;
      default:
        return null;
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0",
        getVariantStyles(),
        className
      )}
      {...props}
    >
      {getDefaultIcon()}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
