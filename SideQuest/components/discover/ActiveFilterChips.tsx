"use client";

import React from "react";
import { HackathonFilterOptions } from "@/lib/db/hackathons";
import { X } from "lucide-react";

interface ActiveFilterChipsProps {
  filters: HackathonFilterOptions;
  onFilterChange: (newFilters: Partial<HackathonFilterOptions>) => void;
  onReset: () => void;
}

export const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = ({
  filters,
  onFilterChange,
  onReset,
}) => {
  const chips: { label: string; onRemove: () => void }[] = [];

  if (filters.q) {
    chips.push({
      label: `"${filters.q}"`,
      onRemove: () => onFilterChange({ q: null, page: 1 }),
    });
  }

  if (filters.mode) {
    chips.push({
      label: `Mode: ${filters.mode}`,
      onRemove: () => onFilterChange({ mode: null, page: 1 }),
    });
  }

  if (filters.city) {
    chips.push({
      label: `City: ${filters.city}`,
      onRemove: () => onFilterChange({ city: null, page: 1 }),
    });
  }

  if (filters.status && filters.status !== "all") {
    chips.push({
      label: `Status: ${filters.status.replace("_", " ")}`,
      onRemove: () => onFilterChange({ status: null, page: 1 }),
    });
  }

  if (filters.prize_min) {
    chips.push({
      label: `Prize ≥ ₹${filters.prize_min.toLocaleString("en-IN")}`,
      onRemove: () => onFilterChange({ prize_min: null, page: 1 }),
    });
  }

  if (filters.tags && filters.tags.length > 0) {
    filters.tags.forEach((tag) => {
      chips.push({
        label: `#${tag}`,
        onRemove: () => {
          const updated = filters.tags!.filter((t) => t !== tag);
          onFilterChange({ tags: updated.length ? updated : null, page: 1 });
        },
      });
    });
  }

  if (filters.include_closed) {
    chips.push({
      label: "Including closed",
      onRemove: () => onFilterChange({ include_closed: false, page: 1 }),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 py-2">
      <span className="text-xs font-bold text-ink-500 mr-1">Active:</span>
      {chips.map((chip, idx) => (
        <span
          key={idx}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white text-ink border border-ink shadow-[1px_1px_0px_#0B1033]"
        >
          <span>{chip.label}</span>
          <button
            onClick={chip.onRemove}
            className="w-3.5 h-3.5 rounded-full hover:bg-parchment flex items-center justify-center text-ink-500 hover:text-urgent"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <button
        onClick={onReset}
        className="text-xs font-bold text-urgent underline hover:no-underline ml-1"
      >
        Clear all
      </button>
    </div>
  );
};

export default ActiveFilterChips;
