"use client";

import React, { Suspense, useState, useEffect, useTransition, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Search,
  SlidersHorizontal,
  X,
  Radio,
  Clock3,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DepartureBoardRow } from "@/components/sidequest/departure-board-row";
import {
  MobileFilterSheet,
  AppliedFilterSummary,
} from "@/components/sidequest/mobile-filter-sheet";
import { DiscoveryFiltersPanel } from "@/components/sidequest/discovery-filters";
import { DiscoverySkeleton } from "@/components/sidequest/discovery-skeleton";
import { HackathonDetail } from "@/components/sidequest/hackathon-detail";
import { QuestDialog } from "@/components/sidequest/quest-dialog";
import { OnboardingCard } from "@/components/sidequest/onboarding-card";
import { Mascot } from "@/components/sidequest/mascot";
import { useCountdownClock, useBookmarks } from "@/components/sidequest/discovery-state";
import { useAuth } from "@/components/sidequest/auth-state";
import {
  activeFilterCount,
  filterHackathons,
  normalizeHackathon,
  type DiscoveryFilters,
  type HackathonUI,
} from "@/lib/hackathons";
import { getHackathons, getLocalDataset } from "@/lib/db/hackathons";
import { calculateMatchScore } from "@/lib/match-score";

function DiscoverView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [rawEvents, setRawEvents] = useState<HackathonUI[]>(() =>
    getLocalDataset().map(normalizeHackathon)
  );
  const [loading, setLoading] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [userCity, setUserCity] = useState<string>("");
  const now = useCountdownClock(Date.now());
  const { saved } = useBookmarks();
  const { user } = useAuth();

  // Load user skills and city from localStorage or profile
  useEffect(() => {
    try {
      const stored = localStorage.getItem("buildseek_user_skills");
      if (stored) {
        setUserSkills(JSON.parse(stored));
      }
      const storedCity = localStorage.getItem("buildseek_user_city");
      if (storedCity) {
        setUserCity(storedCity);
      }
    } catch {}
  }, []);

  // Parse filters from URL
  const filters: DiscoveryFilters = useMemo(() => {
    const q = searchParams.get("q") || undefined;
    const mode = (searchParams.get("mode") as any) || undefined;
    const status = (searchParams.get("status") as any) || undefined;
    const city = searchParams.get("city") || undefined;
    const prize = searchParams.get("prize") ? Number(searchParams.get("prize")) : undefined;
    const tags = searchParams.get("tags") ? searchParams.get("tags")!.split(",") : undefined;
    const students = searchParams.get("students") === "true" || undefined;
    const sort = (searchParams.get("sort") as any) || "closing";
    const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
    const event = searchParams.get("event") || undefined;

    const price = (searchParams.get("price") as any) || undefined;
    const scope = (searchParams.get("scope") as any) || undefined;
    const user_state = searchParams.get("user_state") || undefined;
    const radius_km = searchParams.get("radius_km")
      ? Number(searchParams.get("radius_km"))
      : undefined;
    const user_lat = searchParams.get("user_lat")
      ? Number(searchParams.get("user_lat"))
      : undefined;
    const user_lng = searchParams.get("user_lng")
      ? Number(searchParams.get("user_lng"))
      : undefined;
    const organizersParam =
      searchParams.get("organizers") || searchParams.get("organizer_types");
    const organizer_types = organizersParam
      ? (organizersParam.split(",").filter(Boolean) as any)
      : undefined;

    return {
      q,
      mode,
      status,
      city,
      prize,
      tags,
      students,
      sort,
      page,
      event,
      price,
      scope,
      user_state,
      radius_km,
      user_lat,
      user_lng,
      organizer_types,
    };
  }, [searchParams]);

  // Load latest hackathons from DB / cache
  useEffect(() => {
    let mounted = true;
    getHackathons({ limit: 100, include_closed: false })
      .then((res) => {
        if (!mounted) return;
        const normalized = res.hackathons.map(normalizeHackathon);
        const existingIds = new Set(normalized.map((h) => h.id));
        const local = getLocalDataset().map(normalizeHackathon);
        for (const item of local) {
          if (!existingIds.has(item.id)) {
            normalized.push(item);
          }
        }
        setRawEvents(normalized);
        setLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Filter hackathons strictly sorted by nearest deadline first
  const results = useMemo(() => {
    const list = filterHackathons(rawEvents, filters, now);
    // Sort logic: "closing" sorts strictly by nearest deadline first
    if (!filters.sort || filters.sort === "closing") {
      return [...list].sort((a, b) => {
        const aDl = a.reg_deadline ? Date.parse(a.reg_deadline) : Infinity;
        const bDl = b.reg_deadline ? Date.parse(b.reg_deadline) : Infinity;
        return aDl - bDl;
      });
    }
    return list;
  }, [rawEvents, filters, now]);

  const PAGE_SIZE = 15;
  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const page = Math.min(filters.page ?? 1, pageCount);
  const visible = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selected = rawEvents.find((event) => event.id === filters.event);

  const update = (patch: Partial<DiscoveryFilters>) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    const merged = { ...filters, ...patch };

    if (!("page" in patch)) {
      merged.page = undefined;
    }

    Object.entries(merged).forEach(([k, v]) => {
      const paramKey = k === "organizer_types" ? "organizers" : k;
      if (v === undefined || v === null || v === "") {
        nextParams.delete(paramKey);
        if (k === "organizer_types") nextParams.delete("organizer_types");
      } else if (Array.isArray(v)) {
        if (v.length === 0) {
          nextParams.delete(paramKey);
          if (k === "organizer_types") nextParams.delete("organizer_types");
        } else {
          nextParams.set(paramKey, v.join(","));
        }
      } else {
        nextParams.set(paramKey, String(v));
      }
    });

    startTransition(() => {
      router.replace(`/discover?${nextParams.toString()}`, { scroll: false });
    });
  };

  const [searchTerm, setSearchTerm] = useState(filters.q ?? "");

  useEffect(() => {
    setSearchTerm(filters.q ?? "");
  }, [filters.q]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if ((filters.q ?? "") !== searchTerm) {
        update({ q: searchTerm ? searchTerm : undefined });
      }
    }, 250);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const reset = () => {
    setSearchTerm("");
    const nextParams = new URLSearchParams();
    if (filters.sort) nextParams.set("sort", filters.sort);
    startTransition(() => {
      router.replace(`/discover?${nextParams.toString()}`, { scroll: false });
    });
  };

  return (
    <main className="sq-departure-board-container">
      {/* Station Departure Board Banner */}
      <section className="sq-board-header-banner" aria-label="Departure Board Header">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="sq-board-header-top">
              <span className="sq-board-station-tag">
                <Radio size={14} /> Live Multi-Platform Radar
              </span>
              <div className="sq-board-live-indicator">
                <span className="sq-live-pulse-green" aria-hidden="true" />
                <span>Nearest deadline first</span>
              </div>
            </div>

            <h1 className="sq-board-title">Hackathon Departures.</h1>
            <p className="sq-board-subtitle">
              Real-time deadline radar aggregating Devfolio, Unstop, Devpost, Hack2skill and verified student submissions.
            </p>
          </div>
          <div className="hidden sm:block shrink-0 -mt-2 -mr-2">
            <Mascot className="w-24 h-24 transform rotate-6" />
          </div>
        </div>
      </section>

      {/* Onboarding Starter Quest (if not dismissed) */}
      <OnboardingCard
        savedCount={saved.length}
        hasActiveFilters={activeFilterCount(filters) > 0}
        onFilterPreset={(tag) => update({ tags: [tag] })}
        onComplete={(skills, city) => {
          setUserSkills(skills);
          if (city) {
            setUserCity(city);
          }
        }}
      />

      {/* Search Input Bar */}
      <div className="sq-search-row" style={{ marginBottom: "14px" }}>
        <label className="sq-search-box w-full" style={{ minHeight: "46px" }}>
          <Search size={18} className="text-muted-foreground" />
          <input
            aria-label="Search hackathons"
            placeholder="Search departures by title, organizer, city, or tech stack…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Clear search"
              onClick={() => {
                setSearchTerm("");
                update({ q: undefined });
              }}
            >
              <X size={16} />
            </Button>
          )}
        </label>

        {/* Mobile / Tablet filter button */}
        <Button
          variant="outline"
          className="sq-mobile-filter-button lg:hidden"
          onClick={() => setSheetOpen(true)}
          aria-label={`Open filters${
            activeFilterCount(filters) ? `, ${activeFilterCount(filters)} active` : ""
          }`}
        >
          <SlidersHorizontal size={16} />
          <span>Filters</span>
          {activeFilterCount(filters) > 0 && (
            <span className="sq-filter-count-badge">
              {activeFilterCount(filters)}
            </span>
          )}
        </Button>
      </div>

      {/* Mobile / Tablet Applied Filter Summary Row */}
      <AppliedFilterSummary
        filters={filters}
        onChange={update}
        onReset={reset}
        onOpenSheet={() => setSheetOpen(true)}
      />

      {/* Main Split Layout: Desktop Left Filter Rail + Board Schedule */}
      <div className="sq-discovery-layout">
        {/* Desktop Persistent Left Filter Rail */}
        <aside className="sq-desktop-filters hidden lg:block">
          <DiscoveryFiltersPanel
            filters={filters}
            onChange={update}
            onReset={reset}
          />
        </aside>

        {/* Departure Board Results Area */}
        <section
          className="sq-discovery-results flex-1"
          aria-label="Departure board schedule"
        >
          {/* Board Schedule Header */}
          <div className="sq-board-table-header hidden lg:grid">
            <span>Departure / Deadline</span>
            <span>Event &amp; Organiser</span>
            <span>Location &amp; Team</span>
            <span>Prize Pool</span>
            <span className="text-right">Action</span>
          </div>

          {loading ? (
            <DiscoverySkeleton />
          ) : visible.length > 0 ? (
            <>
              <div className="sq-departure-list">
                {visible.map((event) => {
                  let matchScore: number | null = null;
                  if (userSkills.length > 0 || userCity) {
                    const match = calculateMatchScore(event as any, {
                      skills: userSkills,
                      city: userCity || undefined,
                    });
                    matchScore = match.score;
                  }

                  return (
                    <DepartureBoardRow
                      key={event.id}
                      event={event}
                      now={now}
                      matchScore={matchScore}
                      onOpenDetail={(id) => update({ event: id })}
                    />
                  );
                })}
              </div>

              {/* Pagination controls */}
              {pageCount > 1 && (
                <nav className="sq-pagination" aria-label="Results pages">
                  <Button
                    size="icon"
                    variant="outline"
                    disabled={page === 1}
                    aria-label="Previous page"
                    onClick={() => update({ page: page - 1 })}
                  >
                    <ArrowLeft size={16} />
                  </Button>
                  {Array.from({ length: pageCount }, (_, i) => (
                    <Button
                      key={i}
                      size="icon"
                      variant={page === i + 1 ? "default" : "outline"}
                      aria-label={`Page ${i + 1}`}
                      aria-current={page === i + 1 ? "page" : undefined}
                      onClick={() => update({ page: i + 1 })}
                    >
                      {i + 1}
                    </Button>
                  ))}
                  <Button
                    size="icon"
                    variant="outline"
                    disabled={page === pageCount}
                    aria-label="Next page"
                    onClick={() => update({ page: page + 1 })}
                  >
                    <ArrowRight size={16} />
                  </Button>
                </nav>
              )}
            </>
          ) : (
            /* Actionable Empty State */
            <div className="sq-actionable-empty-state" role="status">
              <div className="sq-empty-board-icon" aria-hidden="true">
                <Clock3 size={32} />
              </div>
              <h2 className="sq-empty-board-heading">
                No departures match your active filters
              </h2>
              <p className="sq-empty-board-sub">
                The radar didn’t find any hackathons matching your exact criteria.
              </p>

              <div className="sq-empty-remedies">
                <strong>What to adjust:</strong>
                <ul>
                  {filters.city && (
                    <li>
                      Remove city filter (<strong>{filters.city}</strong>) or switch to Pan-India.
                    </li>
                  )}
                  {filters.mode === "offline" && (
                    <li>Switch mode to <strong>Online</strong> to see remote hackathons.</li>
                  )}
                  {filters.tags && filters.tags.length > 0 && (
                    <li>
                      Broaden your interest tags (currently: {filters.tags.join(", ")}).
                    </li>
                  )}
                  {filters.prize && filters.prize > 0 && (
                    <li>Lower the minimum prize threshold.</li>
                  )}
                  {filters.q && (
                    <li>
                      Clear keyword &ldquo;<strong>{filters.q}</strong>&rdquo; or try terms like &ldquo;AI&rdquo; or &ldquo;Web&rdquo;.
                    </li>
                  )}
                </ul>
              </div>

              <Button onClick={reset} className="sq-empty-reset-btn">
                <RotateCcw size={15} />
                <span>Reset all filters</span>
              </Button>
            </div>
          )}
        </section>
      </div>

      {/* Mobile Bottom Filter Sheet Drawer */}
      <MobileFilterSheet
        isOpen={sheetOpen}
        onOpen={() => setSheetOpen(true)}
        onClose={() => setSheetOpen(false)}
        filters={filters}
        totalResults={results.length}
        onChange={update}
        onReset={reset}
      />

      {/* Desktop Quick-View Modal */}
      <QuestDialog
        open={Boolean(filters.event)}
        onClose={() => update({ event: undefined })}
        title={selected?.title ?? "Hackathon Details"}
        kind="detail"
      >
        {selected ? (
          <HackathonDetail event={selected} now={now} drawer />
        ) : (
          <div className="sq-discovery-empty">
            <h2>This quest isn’t on the board.</h2>
            <Button onClick={() => update({ event: undefined })}>Back to results</Button>
          </div>
        )}
      </QuestDialog>
    </main>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={<DiscoverySkeleton />}>
      <DiscoverView />
    </Suspense>
  );
}
