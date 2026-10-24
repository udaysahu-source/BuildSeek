"use client";

import React, { Suspense, useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/sidequest/mascot";
import { HackathonCard } from "@/components/sidequest/hackathon-card";
import { HackathonDetail } from "@/components/sidequest/hackathon-detail";
import { DiscoveryFiltersPanel } from "@/components/sidequest/discovery-filters";
import { DiscoverySkeleton } from "@/components/sidequest/discovery-skeleton";
import { QuestDialog } from "@/components/sidequest/quest-dialog";
import { NoSearchResultsState, EmptyState } from "@/components/ui/states";
import { OnboardingCard } from "@/components/sidequest/onboarding-card";
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

function DiscoverView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [rawEvents, setRawEvents] = useState<HackathonUI[]>(() =>
    getLocalDataset().map(normalizeHackathon)
  );
  const [loading, setLoading] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const now = useCountdownClock();
  const { saved } = useBookmarks();
  const { user } = useAuth();

  // Parse filters from URL
  const filters: DiscoveryFilters = React.useMemo(() => {
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

    // V2 Filters
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

  // Load hackathons
  useEffect(() => {
    let mounted = true;
    getHackathons({ limit: 100, include_closed: true })
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

  const results = React.useMemo(
    () => filterHackathons(rawEvents, filters, now),
    [rawEvents, filters, now]
  );

  const PAGE_SIZE = 12;
  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const page = Math.min(filters.page ?? 1, pageCount);
  const visible = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selected = rawEvents.find((event) => event.id === filters.event);
  const count = activeFilterCount(filters);

  const update = (patch: Partial<DiscoveryFilters>) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    const merged = { ...filters, ...patch };

    // Reset page if filtering changed (unless page explicitly in patch)
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

  const chips = [
    ...(filters.q ? [{ label: `“${filters.q}”`, clear: () => update({ q: undefined }) }] : []),
    ...(filters.price && filters.price !== "all"
      ? [{ label: `Fee: ${filters.price}`, clear: () => update({ price: undefined }) }]
      : []),
    ...(filters.scope
      ? [
          {
            label: `Scope: ${filters.scope}${
              filters.scope === "nearby" ? ` (${filters.radius_km || 100}km)` : ""
            }`,
            clear: () =>
              update({
                scope: undefined,
                radius_km: undefined,
                user_lat: undefined,
                user_lng: undefined,
              }),
          },
        ]
      : []),
    ...(filters.user_state
      ? [{ label: `State: ${filters.user_state}`, clear: () => update({ user_state: undefined }) }]
      : []),
    ...(filters.organizer_types ?? []).map((org) => ({
      label: `Org: ${org}`,
      clear: () =>
        update({
          organizer_types: filters.organizer_types?.filter((o) => o !== org),
        }),
    })),
    ...(filters.mode ? [{ label: filters.mode, clear: () => update({ mode: undefined }) }] : []),
    ...(filters.status
      ? [{ label: filters.status.replace("-", " "), clear: () => update({ status: undefined }) }]
      : []),
    ...(filters.city ? [{ label: filters.city, clear: () => update({ city: undefined }) }] : []),
    ...(filters.prize
      ? [{ label: `₹${filters.prize.toLocaleString("en-IN")}+`, clear: () => update({ prize: undefined }) }]
      : []),
    ...(filters.tags ?? []).map((tag) => ({
      label: tag,
      clear: () => update({ tags: filters.tags?.filter((t) => t !== tag) }),
    })),
    ...(filters.students ? [{ label: "Students only", clear: () => update({ students: undefined }) }] : []),
  ];

  return (
    <main className="sq-discover sq-container">
      <header className="sq-discover-heading">
        <div>
          <span className="sq-eyebrow">
            <Sparkles size={13} /> Your next main character moment
          </span>
          <h1>
            Find your next <span>BuildSeek.</span>
          </h1>
          <p>Big ideas, fresh challenges, and a deadline worth beating.</p>
        </div>
        <Mascot className="sq-discover-mascot" />
      </header>

      <OnboardingCard
        savedCount={saved.length}
        hasActiveFilters={chips.length > 0}
        onFilterPreset={(tag) => update({ tags: [tag] })}
      />

      <div className="sq-discovery-notice">
        <span>
          <strong>Live radar</strong> · {rawEvents.length} hackathons across India’s campus clubs & platforms.
        </span>
        <span role="status">
          {user
            ? `${saved.length} saved in your Quest Log`
            : "Log in to keep your favourite quests"}
        </span>
      </div>

      <div className="sq-search-row">
        <label className="sq-search-box">
          <Search size={20} />
          <input
            aria-label="Search hackathons"
            placeholder="Search hackathons, themes, colleges…"
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
              <X />
            </Button>
          )}
        </label>
        <Button
          variant="outline"
          className="sq-mobile-filter-button"
          onClick={() => setSheetOpen(true)}
          aria-label={`Filters${count ? `, ${count} active` : ""}`}
        >
          <SlidersHorizontal />
          {count > 0 && <span>{count}</span>}
        </Button>
      </div>

      {chips.length > 0 && (
        <div className="sq-active-filters">
          {chips.map((chip) => (
            <Button
              key={chip.label}
              variant="outline"
              size="sm"
              onClick={chip.clear}
              aria-label={`Remove ${chip.label} filter`}
            >
              {chip.label}
              <X size={12} />
            </Button>
          ))}
          <Button variant="ghost" size="sm" onClick={reset}>
            Clear all
          </Button>
        </div>
      )}

      {/* Quick filter presets */}
      <div
        className="sq-quick-presets"
        style={{
          display: "flex",
          gap: "8px",
          overflowX: "auto",
          paddingBottom: "10px",
          marginBottom: "12px",
          scrollbarWidth: "none",
        }}
        role="group"
        aria-label="Popular filter presets"
      >
        <Button
          size="sm"
          variant={filters.status === "closing-soon" ? "default" : "outline"}
          onClick={() =>
            update({
              status: filters.status === "closing-soon" ? undefined : "closing-soon",
            })
          }
          style={{ height: "32px", fontSize: "12px", whiteSpace: "nowrap" }}
        >
          ⏰ Closing in 7 days
        </Button>
        <Button
          size="sm"
          variant={filters.price === "free" ? "default" : "outline"}
          onClick={() =>
            update({
              price: filters.price === "free" ? undefined : "free",
            })
          }
          style={{ height: "32px", fontSize: "12px", whiteSpace: "nowrap" }}
        >
          🆓 Free only
        </Button>
        <Button
          size="sm"
          variant={filters.mode === "online" ? "default" : "outline"}
          onClick={() =>
            update({
              mode: filters.mode === "online" ? undefined : "online",
            })
          }
          style={{ height: "32px", fontSize: "12px", whiteSpace: "nowrap" }}
        >
          🌐 Online
        </Button>
        <Button
          size="sm"
          variant={
            filters.organizer_types?.includes("college") ? "default" : "outline"
          }
          onClick={() =>
            update({
              organizer_types: filters.organizer_types?.includes("college")
                ? undefined
                : ["college"],
            })
          }
          style={{ height: "32px", fontSize: "12px", whiteSpace: "nowrap" }}
        >
          🎓 College
        </Button>
        <Button
          size="sm"
          variant={
            filters.scope === "national" ? "default" : "outline"
          }
          onClick={() =>
            update({
              scope: filters.scope === "national" ? undefined : "national",
            })
          }
          style={{ height: "32px", fontSize: "12px", whiteSpace: "nowrap" }}
        >
          🇮🇳 National
        </Button>
      </div>

      <div className="sq-discovery-layout">
        <aside className="sq-desktop-filters">
          <DiscoveryFiltersPanel filters={filters} onChange={update} onReset={reset} />
        </aside>

        <section className="sq-discovery-results" aria-label="Hackathon results">
          <div className="sq-results-toolbar">
            <p>
              <strong>{results.length}</strong> hackathons
              {count ? " for you" : " to explore"}
            </p>
            <label>
              Sort by
              <select
                aria-label="Sort hackathons"
                value={filters.sort ?? "closing"}
                onChange={(e) => {
                  const value = e.target.value;
                  update({
                    sort: value === "match" || value === "prize" ? value : "closing",
                  });
                }}
              >
                <option value="closing">Closing soon</option>
                <option value="match">Best match</option>
                <option value="prize">Prize</option>
              </select>
            </label>
          </div>

          {loading ? (
            <DiscoverySkeleton />
          ) : visible.length ? (
            <>
              <div className="sq-event-grid">
                {visible.map((event) => (
                  <HackathonCard
                    key={event.id}
                    event={event}
                    now={now}
                    onOpen={(id) => update({ event: id })}
                  />
                ))}
              </div>

              <nav className="sq-pagination" aria-label="Results pages">
                <Button
                  size="icon"
                  variant="outline"
                  disabled={page === 1}
                  aria-label="Previous page"
                  onClick={() => update({ page: page - 1 })}
                >
                  <ArrowLeft />
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
                  <ArrowRight />
                </Button>
              </nav>
            </>
          ) : (
            filters.q ? (
              <NoSearchResultsState query={filters.q} onClear={reset} />
            ) : (
              <EmptyState
                title="No quests found in this realm."
                description="The scouts couldn't find any hackathons matching your active filters. Try widening your radius, changing mode, or clearing filters."
                actionText="Reset All Filters"
                onAction={reset}
              />
            )
          )}
        </section>
      </div>

      <QuestDialog
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Find your kind of quest"
        kind="filters"
      >
        <DiscoveryFiltersPanel filters={filters} onChange={update} onReset={reset} />
        <div className="sq-sheet-actions">
          <Button onClick={() => setSheetOpen(false)}>
            Show {results.length} hackathons <ArrowRight />
          </Button>
        </div>
      </QuestDialog>

      <QuestDialog
        open={Boolean(filters.event)}
        onClose={() => update({ event: undefined })}
        title={selected?.title ?? "Hackathon not found"}
        kind="detail"
      >
        {selected ? (
          <HackathonDetail event={selected} now={now} drawer />
        ) : (
          <div className="sq-discovery-empty">
            <Mascot />
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
