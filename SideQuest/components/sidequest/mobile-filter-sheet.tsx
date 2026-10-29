"use client";

import React, { useState, useEffect } from "react";
import {
  SlidersHorizontal,
  X,
  RotateCcw,
  Search,
  Check,
  Globe2,
  MapPin,
  Users,
  Trophy,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CITIES, THEMES, type DiscoveryFilters } from "@/lib/hackathons";

export interface MobileFilterSheetProps {
  filters: DiscoveryFilters;
  totalResults: number;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onChange: (patch: Partial<DiscoveryFilters>) => void;
  onReset: () => void;
}

export function AppliedFilterSummary({
  filters,
  onChange,
  onReset,
  onOpenSheet,
}: {
  filters: DiscoveryFilters;
  onChange: (patch: Partial<DiscoveryFilters>) => void;
  onReset: () => void;
  onOpenSheet: () => void;
}) {
  const activeChips: { label: string; onRemove: () => void }[] = [];

  if (filters.q) {
    activeChips.push({
      label: `"${filters.q}"`,
      onRemove: () => onChange({ q: undefined }),
    });
  }

  if (filters.mode) {
    activeChips.push({
      label: filters.mode === "offline" ? "On-campus" : "Online",
      onRemove: () => onChange({ mode: undefined }),
    });
  }

  if (filters.city) {
    activeChips.push({
      label: filters.city,
      onRemove: () => onChange({ city: undefined }),
    });
  }

  if (filters.tags && filters.tags.length > 0) {
    filters.tags.forEach((tag) => {
      activeChips.push({
        label: tag,
        onRemove: () => {
          const next = filters.tags?.filter((t) => t !== tag);
          onChange({ tags: next && next.length > 0 ? next : undefined });
        },
      });
    });
  }

  if (filters.students) {
    activeChips.push({
      label: "Students only",
      onRemove: () => onChange({ students: undefined }),
    });
  }

  if (filters.prize && filters.prize > 0) {
    activeChips.push({
      label: `₹${(filters.prize / 100000).toFixed(0)}L+ prize`,
      onRemove: () => onChange({ prize: undefined }),
    });
  }

  return (
    <div className="sq-applied-summary-bar" aria-label="Applied filters summary">
      <button
        type="button"
        onClick={onOpenSheet}
        className="sq-applied-filter-trigger"
        aria-label="Open filter options"
      >
        <SlidersHorizontal size={15} />
        <span>Filters</span>
        {activeChips.length > 0 && (
          <span className="sq-filter-count-badge">{activeChips.length}</span>
        )}
      </button>

      <div className="sq-applied-chips-scroll">
        {activeChips.map((chip, idx) => (
          <span key={idx} className="sq-applied-chip">
            <span>{chip.label}</span>
            <button
              type="button"
              onClick={chip.onRemove}
              aria-label={`Remove filter ${chip.label}`}
              className="sq-applied-chip-remove"
            >
              <X size={12} />
            </button>
          </span>
        ))}

        {activeChips.length > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="sq-applied-clear-all"
            aria-label="Clear all applied filters"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}

export function MobileFilterSheet({
  filters,
  totalResults,
  isOpen,
  onOpen,
  onClose,
  onChange,
  onReset,
}: MobileFilterSheetProps) {
  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTagToggle = (tag: string) => {
    const current = filters.tags || [];
    const exists = current.includes(tag);
    const next = exists ? current.filter((t) => t !== tag) : [...current, tag];
    onChange({ tags: next.length > 0 ? next : undefined });
  };

  return (
    <div className="sq-sheet-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Filter hackathons">
      <div
        className="sq-bottom-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle indicator */}
        <div className="sq-sheet-handle" aria-hidden="true" />

        <div className="sq-sheet-header">
          <div className="sq-sheet-title-row">
            <h2 className="sq-sheet-heading">
              <SlidersHorizontal size={18} />
              Filter Departures
            </h2>
            <button
              type="button"
              onClick={onReset}
              className="sq-sheet-reset-btn"
              title="Reset all filters"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="sq-sheet-close-btn"
            aria-label="Close filters sheet"
          >
            <X size={20} />
          </button>
        </div>

        <div className="sq-sheet-content">
          {/* Mode: Online / On-campus */}
          <section className="sq-sheet-section">
            <label className="sq-sheet-label">Mode & Format</label>
            <div className="sq-segmented-grid">
              {[
                { id: undefined, label: "All Modes" },
                { id: "online", label: "Online" },
                { id: "offline", label: "On-campus" },
              ].map((opt) => {
                const isSelected = filters.mode === opt.id;
                return (
                  <button
                    key={String(opt.id)}
                    type="button"
                    onClick={() => onChange({ mode: opt.id as any })}
                    className={`sq-segment-btn ${isSelected ? "is-selected" : ""}`}
                    aria-pressed={isSelected}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* City Selector */}
          <section className="sq-sheet-section">
            <label className="sq-sheet-label">City</label>
            <div className="sq-chips-grid">
              {CITIES.map((city) => {
                const isSelected = filters.city?.toLowerCase() === city.toLowerCase();
                return (
                  <button
                    key={city}
                    type="button"
                    onClick={() =>
                      onChange({
                        city: isSelected ? undefined : city === "Pan India" ? undefined : city,
                      })
                    }
                    className={`sq-chip-btn ${isSelected ? "is-selected" : ""}`}
                    aria-pressed={isSelected}
                  >
                    {city}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Interests / Tech Stacks */}
          <section className="sq-sheet-section">
            <label className="sq-sheet-label">Interests & Stacks</label>
            <div className="sq-chips-grid">
              {THEMES.map((theme) => {
                const isSelected = filters.tags?.includes(theme);
                return (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => handleTagToggle(theme)}
                    className={`sq-chip-btn ${isSelected ? "is-selected" : ""}`}
                    aria-pressed={isSelected}
                  >
                    {isSelected && <Check size={13} className="shrink-0" />}
                    <span>{theme}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Prize Budget */}
          <section className="sq-sheet-section">
            <label className="sq-sheet-label">Prize Pool</label>
            <div className="sq-segmented-grid">
              {[
                { val: undefined, label: "Any Prize" },
                { val: 100000, label: "₹1L+" },
                { val: 500000, label: "₹5L+" },
                { val: 1000000, label: "₹10L+" },
              ].map((p) => {
                const isSelected = filters.prize === p.val;
                return (
                  <button
                    key={String(p.val)}
                    type="button"
                    onClick={() => onChange({ prize: p.val })}
                    className={`sq-segment-btn ${isSelected ? "is-selected" : ""}`}
                    aria-pressed={isSelected}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Students Only Toggle */}
          <section className="sq-sheet-section">
            <label className="sq-toggle-row">
              <div className="sq-toggle-info">
                <span className="sq-toggle-title">
                  <GraduationCap size={16} /> Students only
                </span>
                <span className="sq-toggle-sub">
                  Only show hackathons specifically open to college students
                </span>
              </div>
              <input
                type="checkbox"
                checked={Boolean(filters.students)}
                onChange={(e) => onChange({ students: e.target.checked || undefined })}
                className="sq-switch"
                aria-label="Filter students only hackathons"
              />
            </label>
          </section>
        </div>

        {/* Footer with Result Counter CTA */}
        <div className="sq-sheet-footer">
          <Button
            type="button"
            onClick={onClose}
            className="sq-sheet-apply-btn w-full font-condensed text-lg uppercase tracking-wider"
          >
            Show {totalResults} {totalResults === 1 ? "Departure" : "Departures"}
          </Button>
        </div>
      </div>
    </div>
  );
}
