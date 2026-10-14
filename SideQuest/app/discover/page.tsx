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
import { useCountdownClock, useBookmarks } from "@/components/sidequest/discovery-state";
import { useAuth } from "@/components/sidequest/auth-state";
import {
  activeFilterCount,
  filterHackathons,
  normalizeHackathon,
  type DiscoveryFilters,
  type HackathonUI,
} from "@/lib/hackathons";
import { getHackathons } from "@/lib/db/hackathons";

function DiscoverView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [rawEvents, setRawEvents] = useState<HackathonUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const now = useCountdownClock(Date.now());
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

    return { q, mode, status, city, prize, tags, students, sort, page, event };
  }, [searchParams]);

  // Load hackathons
  useEffect(() => {
    let mounted = true;
    getHackathons({ limit: 100 })
      .then((res) => {
        if (!mounted) return;
        const normalized = res.hackathons.map(normalizeHackathon);
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

  const pageCount = Math.max(1, Math.ceil(results.length / 6));
  const page = Math.min(filters.page ?? 1, pageCount);
  const visible = results.slice((page - 1) * 6, page * 6);
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
      if (v === undefined || v === null || v === "") {
        nextParams.delete(k);
      } else if (Array.isArray(v)) {
        if (v.length === 0) nextParams.delete(k);
        else nextParams.set(k, v.join(","));
      } else {
        nextParams.set(k, String(v));
      }
    });

    startTransition(() => {
      router.replace(`/discover?${nextParams.toString()}`, { scroll: false });
    });
  };

  const reset = () => {
    const nextParams = new URLSearchParams();
    if (filters.sort) nextParams.set("sort", filters.sort);
    startTransition(() => {
      router.replace(`/discover?${nextParams.toString()}`, { scroll: false });
    });
  };

  const chips = [
    ...(filters.q ? [{ label: `“${filters.q}”`, clear: () => update({ q: undefined }) }] : []),
    ...(filters.mode ? [{ label: filters.mode, clear: () => update({ mode: undefined }) }] : []),
    ...(filters.status ? [{ label: filters.status.replace("-", " "), clear: () => update({ status: undefined }) }] : []),
    ...(filters.city ? [{ label: filters.city, clear: () => update({ city: undefined }) }] : []),
    ...(filters.prize ? [{ label: `₹${filters.prize.toLocaleString("en-IN")}+`, clear: () => update({ prize: undefined }) }] : []),
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
            Find your next <span>SideQuest.</span>
          </h1>
          <p>Big ideas, fresh challenges, and a deadline worth beating.</p>
        </div>
        <Mascot className="sq-discover-mascot" />
      </header>

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
            value={filters.q ?? ""}
            onChange={(e) => update({ q: e.target.value || undefined })}
          />
          {filters.q && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Clear search"
              onClick={() => update({ q: undefined })}
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
            <div className="sq-discovery-empty">
              <Mascot />
              <h2>No quests on this trail.</h2>
              <p>Try a different theme or city. Your next big idea is still out there.</p>
              <Button onClick={reset}>Reset filters</Button>
            </div>
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
