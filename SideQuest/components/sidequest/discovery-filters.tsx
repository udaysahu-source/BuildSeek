"use client";

import { Filter, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CITIES, THEMES, type DiscoveryFilters } from "@/lib/hackathons";

export function DiscoveryFiltersPanel({
  filters,
  onChange,
  onReset,
}: {
  filters: DiscoveryFilters;
  onChange: (patch: Partial<DiscoveryFilters>) => void;
  onReset: () => void;
}) {
  return (
    <div className="sq-filter-panel">
      <div className="sq-filter-title">
        <h2>
          <Filter size={17} /> Filters
        </h2>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Reset filters"
          title="Reset filters"
          onClick={onReset}
        >
          <RotateCcw size={16} />
        </Button>
      </div>

      <fieldset>
        <legend>Mode</legend>
        <div className="sq-filter-options">
          {(["online", "offline", "hybrid"] as const).map((mode) => (
            <Button
              key={mode}
              variant="outline"
              size="sm"
              aria-pressed={filters.mode === mode}
              className={filters.mode === mode ? "sq-filter-selected" : ""}
              onClick={() => onChange({ mode: filters.mode === mode ? undefined : mode })}
            >
              {mode}
            </Button>
          ))}
        </div>
      </fieldset>

      <label className="sq-filter-label">
        Registration status
        <select
          value={filters.status ?? ""}
          onChange={(e) => {
            const value = e.target.value;
            onChange({
              status:
                value === "upcoming" ||
                value === "open" ||
                value === "closing-soon" ||
                value === "closed"
                  ? value
                  : undefined,
            });
          }}
        >
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="closing-soon">Closing soon</option>
          <option value="upcoming">Upcoming</option>
          <option value="closed">Closed</option>
        </select>
      </label>

      <label className="sq-filter-label">
        City
        <select
          value={filters.city ?? ""}
          onChange={(e) => onChange({ city: e.target.value || undefined })}
        >
          <option value="">All cities</option>
          {CITIES.map((city) => (
            <option key={city}>{city}</option>
          ))}
        </select>
      </label>

      <label className="sq-filter-label sq-prize-label">
        Minimum prize
        <strong>₹{(filters.prize ?? 0).toLocaleString("en-IN")}</strong>
        <input
          type="range"
          min="0"
          max="500000"
          step="25000"
          value={filters.prize ?? 0}
          onChange={(e) => onChange({ prize: Number(e.target.value) || undefined })}
        />
        <span className="sq-range-labels">
          <span>₹0</span>
          <span>₹5,00,000</span>
        </span>
      </label>

      <fieldset>
        <legend>Theme</legend>
        <div className="sq-theme-options">
          {THEMES.map((tag) => (
            <label key={tag}>
              <input
                type="checkbox"
                checked={filters.tags?.includes(tag) ?? false}
                onChange={() => {
                  const tags = filters.tags ?? [];
                  onChange({
                    tags: tags.includes(tag)
                      ? tags.filter((t) => t !== tag)
                      : [...tags, tag],
                  });
                }}
              />
              {tag}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="sq-students-check">
        <input
          type="checkbox"
          checked={filters.students ?? false}
          onChange={(e) => onChange({ students: e.target.checked || undefined })}
        />
        <span>
          Students only
          <small>Made for the campus crowd</small>
        </span>
      </label>
    </div>
  );
}
