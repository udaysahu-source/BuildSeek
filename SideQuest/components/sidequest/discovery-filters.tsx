"use client";

import { useState } from "react";
import { Filter, RotateCcw, Crosshair } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CITIES, THEMES, type DiscoveryFilters } from "@/lib/hackathons";

export const INDIAN_STATES = [
  "Karnataka",
  "Delhi",
  "Maharashtra",
  "Telangana",
  "Tamil Nadu",
  "Uttar Pradesh",
  "Gujarat",
  "West Bengal",
  "Kerala",
  "Rajasthan",
  "Punjab",
  "Haryana",
];

const ORGANIZER_TYPES = [
  { id: "government", label: "Government" },
  { id: "company", label: "Company" },
  { id: "college", label: "College" },
  { id: "community", label: "Community" },
  { id: "nonprofit", label: "Nonprofit" },
] as const;

export function DiscoveryFiltersPanel({
  filters,
  onChange,
  onReset,
}: {
  filters: DiscoveryFilters;
  onChange: (patch: Partial<DiscoveryFilters>) => void;
  onReset: () => void;
}) {
  const [geoLocating, setGeoLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const requestGeolocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoError("Geolocation not supported");
      return;
    }
    setGeoLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLocating(false);
        onChange({
          scope: "nearby",
          user_lat: Number(pos.coords.latitude.toFixed(4)),
          user_lng: Number(pos.coords.longitude.toFixed(4)),
        });
      },
      () => {
        setGeoLocating(false);
        setGeoError("Location access denied");
      },
      { timeout: 8000 }
    );
  };

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

      {/* 1. Price Segmented Control (v2) */}
      <fieldset>
        <legend>Price</legend>
        <div className="sq-filter-options sq-filter-options-3">
          {[
            { id: "all", label: "All" },
            { id: "free", label: "Free" },
            { id: "paid", label: "Paid" },
          ].map(({ id, label }) => {
            const isSelected = (!filters.price && id === "all") || filters.price === id;
            return (
              <Button
                key={id}
                variant="outline"
                size="sm"
                aria-pressed={isSelected}
                className={isSelected ? "sq-filter-selected" : ""}
                onClick={() => onChange({ price: id === "all" ? undefined : (id as any) })}
              >
                {label}
              </Button>
            );
          })}
        </div>
      </fieldset>

      {/* 2. Scope Chips (v2) */}
      <fieldset>
        <legend>Scope</legend>
        <div className="sq-filter-options sq-filter-options-2">
          {[
            { id: "global", label: "Global" },
            { id: "national", label: "National" },
            { id: "state", label: "State" },
            { id: "nearby", label: "Nearby" },
          ].map(({ id, label }) => {
            const isSelected = filters.scope === id;
            return (
              <Button
                key={id}
                variant="outline"
                size="sm"
                aria-pressed={isSelected}
                className={isSelected ? "sq-filter-selected" : ""}
                onClick={() => {
                  if (isSelected) {
                    onChange({ scope: undefined, user_lat: undefined, user_lng: undefined });
                  } else {
                    onChange({ scope: id as any });
                    if (id === "nearby" && !filters.user_lat) {
                      requestGeolocation();
                    }
                  }
                }}
              >
                {label}
              </Button>
            );
          })}
        </div>

        {/* Nearby Radius & Geolocation Controls */}
        {filters.scope === "nearby" && (
          <div className="sq-nearby-controls" style={{ marginTop: 10 }}>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 6 }}>
              {[25, 50, 100, 250].map((r) => (
                <Button
                  key={r}
                  size="sm"
                  variant="outline"
                  className={(filters.radius_km || 100) === r ? "sq-filter-selected" : ""}
                  style={{ fontSize: 10, padding: "2px 8px", height: 26 }}
                  onClick={() => onChange({ radius_km: r })}
                >
                  {r} km
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={geoLocating}
              onClick={requestGeolocation}
              style={{ fontSize: 10, width: "100%", gap: 4 }}
            >
              <Crosshair size={12} />
              {geoLocating
                ? "Locating…"
                : filters.user_lat
                ? "Location locked ✓"
                : "Use browser location"}
            </Button>
            {geoError && <small style={{ color: "var(--red)", fontSize: 9 }}>{geoError}</small>}
          </div>
        )}

        {/* State Selection when Scope is State */}
        {filters.scope === "state" && (
          <label className="sq-filter-label" style={{ marginTop: 10 }}>
            Select State
            <select
              value={filters.user_state ?? ""}
              onChange={(e) => onChange({ user_state: e.target.value || undefined })}
            >
              <option value="">All states</option>
              {INDIAN_STATES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </label>
        )}
      </fieldset>

      {/* 3. Organizer Type Chips (v2 Multi-select) */}
      <fieldset>
        <legend>Organizer type</legend>
        <div className="sq-theme-options">
          {ORGANIZER_TYPES.map(({ id, label }) => {
            const orgs = filters.organizer_types ?? [];
            const isChecked = orgs.includes(id as any);
            return (
              <label key={id}>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {
                    const nextOrgs = isChecked
                      ? orgs.filter((o) => o !== id)
                      : [...orgs, id as any];
                    onChange({
                      organizer_types: nextOrgs.length > 0 ? nextOrgs : undefined,
                    });
                  }}
                />
                {label}
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* 4. Mode */}
      <fieldset>
        <legend>Mode</legend>
        <div className="sq-filter-options sq-filter-options-3">
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

      {/* 5. Registration status */}
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

      {/* 6. City */}
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

      {/* 7. Minimum Prize */}
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

      {/* 8. Theme Tags */}
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

      {/* 9. Students Only */}
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
