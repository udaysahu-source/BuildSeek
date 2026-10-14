"use client";

import React from "react";
import { HackathonFilterOptions } from "@/lib/db/hackathons";
import { HackathonMode, HackathonStatus } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Filter, RotateCcw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterSidebarProps {
  filters: HackathonFilterOptions;
  onFilterChange: (newFilters: Partial<HackathonFilterOptions>) => void;
  onReset: () => void;
  className?: string;
  isMobileModal?: boolean;
}

const POPULAR_TAGS = [
  "ai",
  "web3",
  "beginners",
  "fintech",
  "iot",
  "robotics",
  "open-source",
  "gaming",
];

const POPULAR_CITIES = [
  "Bengaluru",
  "New Delhi",
  "Hyderabad",
  "Pune",
  "Mumbai",
  "Chennai",
  "Kolkata",
  "Jaipur",
];

const PRIZE_OPTIONS = [
  { label: "Any Prize", value: 0 },
  { label: "₹50k+", value: 50000 },
  { label: "₹1,00,000+", value: 100000 },
  { label: "₹2,50,000+", value: 250000 },
  { label: "₹5,00,000+", value: 500000 },
];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
  onReset,
  className,
  isMobileModal = false,
}) => {
  const toggleTag = (tag: string) => {
    const current = filters.tags || [];
    const exists = current.includes(tag);
    const updated = exists
      ? current.filter((t) => t !== tag)
      : [...current, tag];
    onFilterChange({ tags: updated.length ? updated : null, page: 1 });
  };

  return (
    <aside
      className={cn(
        "flex flex-col gap-6 text-ink",
        !isMobileModal && "retro-card p-5 bg-white sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-parchment-border pb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-ink" />
          <h3 className="font-display font-bold text-base text-ink">Filters</h3>
        </div>
        <button
          onClick={onReset}
          className="text-xs font-bold text-ink-500 hover:text-urgent flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset All</span>
        </button>
      </div>

      {/* Mode */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-ink-700">
          Participation Mode
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {(["all", "online", "offline", "hybrid"] as const).map((m) => {
            const isSelected =
              (m === "all" && !filters.mode) || filters.mode === m;
            return (
              <button
                key={m}
                onClick={() =>
                  onFilterChange({ mode: m === "all" ? null : m, page: 1 })
                }
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold capitalize border-2 text-center transition-all",
                  isSelected
                    ? "bg-ink text-white border-ink shadow-solid-sm"
                    : "bg-white text-ink border-parchment-border hover:border-ink hover:bg-parchment-subtle"
                )}
              >
                {m}
              </button>
            );
          })}
        </div>
      </div>

      {/* Status Filter */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-ink-700">
          Registration Status
        </label>
        <div className="flex flex-col gap-1.5">
          {[
            { id: "all", label: "All Active (Open & Closing Soon)" },
            { id: "closing_soon", label: "⚡ Closing Soon (< 72 Hours)" },
            { id: "open", label: "🟢 Open for Registration" },
            { id: "upcoming", label: "⏳ Upcoming Registration" },
          ].map((st) => {
            const isSelected =
              (!filters.status && st.id === "all") ||
              filters.status === st.id;
            return (
              <button
                key={st.id}
                onClick={() =>
                  onFilterChange({
                    status: (st.id === "all" ? null : st.id) as HackathonStatus | null,
                    page: 1,
                  })
                }
                className={cn(
                  "px-3 py-2 rounded-xl text-xs font-bold text-left border-2 transition-all flex items-center justify-between",
                  isSelected
                    ? "bg-parchment-subtle text-ink border-ink font-extrabold"
                    : "bg-white text-ink-700 border-transparent hover:bg-parchment/60"
                )}
              >
                <span>{st.label}</span>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-lime border border-ink" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* City */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-ink-700">
          City / College Hub
        </label>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_CITIES.map((c) => {
            const isSelected =
              filters.city?.toLowerCase() === c.toLowerCase();
            return (
              <button
                key={c}
                onClick={() =>
                  onFilterChange({
                    city: isSelected ? null : c,
                    mode: isSelected ? null : "offline",
                    page: 1,
                  })
                }
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-semibold border transition-all",
                  isSelected
                    ? "bg-lime text-ink border-ink shadow-solid-sm font-bold"
                    : "bg-white text-ink-700 border-parchment-border hover:border-ink"
                )}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Prize Minimum */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-ink-700 flex items-center justify-between">
          <span>Minimum Prize</span>
          <Sparkles className="w-3.5 h-3.5 text-lime-dark" />
        </label>
        <div className="flex flex-col gap-1">
          {PRIZE_OPTIONS.map((p) => {
            const isSelected = (filters.prize_min || 0) === p.value;
            return (
              <button
                key={p.value}
                onClick={() =>
                  onFilterChange({
                    prize_min: p.value === 0 ? null : p.value,
                    page: 1,
                  })
                }
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold text-left transition-colors flex items-center justify-between",
                  isSelected
                    ? "bg-lime-light text-ink font-bold border border-lime-dark"
                    : "text-ink-700 hover:bg-parchment-subtle"
                )}
              >
                <span>{p.label}</span>
                {isSelected && <span className="text-lime-dark font-bold">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Popular Tags */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-ink-700">
          Themes & Skills
        </label>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_TAGS.map((tag) => {
            const isSelected = (filters.tags || []).includes(tag);
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-semibold border transition-all",
                  isSelected
                    ? "bg-ink text-white border-ink shadow-solid-sm"
                    : "bg-white text-ink-700 border-parchment-border hover:border-ink hover:bg-parchment-subtle"
                )}
              >
                #{tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Include Closed Toggle */}
      <div className="pt-3 border-t border-parchment-border">
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-xs font-semibold text-ink-700 group-hover:text-ink">
            Include Closed Events
          </span>
          <input
            type="checkbox"
            checked={!!filters.include_closed}
            onChange={(e) =>
              onFilterChange({ include_closed: e.target.checked, page: 1 })
            }
            className="w-4 h-4 rounded border-2 border-ink text-ink accent-ink focus:ring-ink"
          />
        </label>
      </div>
    </aside>
  );
};

export default FilterSidebar;
