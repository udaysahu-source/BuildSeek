"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HackathonFilterOptions, getHackathons, HackathonListResult } from "@/lib/db/hackathons";
import { parseSearchParamsToFilters, filtersToQueryString } from "@/lib/filters";
import HackathonCard from "@/components/hackathon/HackathonCard";
import FilterSidebar from "@/components/discover/FilterSidebar";
import MobileFilterSheet from "@/components/discover/MobileFilterSheet";
import ActiveFilterChips from "@/components/discover/ActiveFilterChips";
import EmptyState from "@/components/discover/EmptyState";
import Button from "@/components/ui/Button";
import { Search, SlidersHorizontal, ArrowUpDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

function DiscoverContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse filters from URL search params
  const paramObj: Record<string, string> = {};
  searchParams.forEach((val, key) => {
    paramObj[key] = val;
  });

  const activeFilters = React.useMemo(
    () => parseSearchParamsToFilters(paramObj),
    [searchParams]
  );

  const [searchInput, setSearchInput] = React.useState(activeFilters.q || "");
  const [data, setData] = React.useState<HackathonListResult | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = React.useState(false);

  // Sync search input when URL changes
  React.useEffect(() => {
    setSearchInput(activeFilters.q || "");
  }, [activeFilters.q]);

  // Fetch hackathons whenever activeFilters change
  React.useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getHackathons(activeFilters).then((res) => {
      if (isMounted) {
        setData(res);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [activeFilters]);

  // Update URL params
  const updateFilters = (newFilters: Partial<HackathonFilterOptions>) => {
    const merged = { ...activeFilters, ...newFilters };
    const qs = filtersToQueryString(merged);
    router.push(`/discover${qs}`, { scroll: false });
  };

  const resetAllFilters = () => {
    router.push("/discover", { scroll: false });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ q: searchInput.trim() || null, page: 1 });
  };

  // Count active non-default filters for mobile badge
  const activeFilterCount = [
    activeFilters.q,
    activeFilters.mode,
    activeFilters.city,
    activeFilters.status && activeFilters.status !== "all",
    activeFilters.tags && activeFilters.tags.length > 0,
    activeFilters.prize_min,
    activeFilters.team_max,
    activeFilters.include_closed,
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
      {/* Top Banner / Search bar */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-ink tracking-tight">
              Discover Hackathons
            </h1>
            <p className="text-xs sm:text-sm text-ink-500 mt-0.5">
              Live radar across Indian colleges & platforms with countdown alerts
            </p>
          </div>

          {/* Search Box */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2 max-w-md w-full"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-ink-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search hackathons, topics, colleges..."
                className="w-full pl-9 pr-4 py-2 bg-white text-xs sm:text-sm font-semibold rounded-full border-2 border-ink shadow-solid-sm focus:outline-none focus:ring-2 focus:ring-lime"
              />
            </div>
            <Button variant="lime" size="sm" type="submit">
              Search
            </Button>
          </form>
        </div>

        {/* Mobile Filter Button & Quick Mode Bar */}
        <div className="flex md:hidden items-center justify-between gap-2 pt-2">
          {/* Quick mode pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {(["all", "online", "offline", "hybrid"] as const).map((m) => {
              const isSelected =
                (m === "all" && !activeFilters.mode) || activeFilters.mode === m;
              return (
                <button
                  key={m}
                  onClick={() =>
                    updateFilters({ mode: m === "all" ? null : m, page: 1 })
                  }
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold capitalize whitespace-nowrap border transition-all",
                    isSelected
                      ? "bg-ink text-white border-ink shadow-solid-sm"
                      : "bg-white text-ink-700 border-parchment-border"
                  )}
                >
                  {m}
                </button>
              );
            })}
          </div>

          {/* Filter Sheet trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFilterSheetOpen(true)}
            icon={<SlidersHorizontal className="w-3.5 h-3.5" />}
            className="shrink-0 relative"
          >
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-lime border border-ink text-[10px] font-bold flex items-center justify-center text-ink ml-1">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Main Grid: Sidebar (Desktop) + Hackathon Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Desktop Left Sidebar */}
        <div className="hidden md:block md:col-span-1">
          <FilterSidebar
            filters={activeFilters}
            onFilterChange={updateFilters}
            onReset={resetAllFilters}
          />
        </div>

        {/* Hackathon Cards List */}
        <div className="md:col-span-3 space-y-4">
          {/* Active Filter Chips & Sort header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-parchment-border pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-ink">
                {loading
                  ? "Scanning hackathons..."
                  : `${data?.total || 0} active hackathons found`}
              </span>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs font-bold text-ink">
              <ArrowUpDown className="w-3.5 h-3.5 text-ink-500" />
              <label htmlFor="sort-select" className="text-ink-500">
                Sort:
              </label>
              <select
                id="sort-select"
                value={activeFilters.sort || "closing_soon"}
                onChange={(e) =>
                  updateFilters({
                    sort: e.target.value as HackathonFilterOptions["sort"],
                    page: 1,
                  })
                }
                className="bg-white border-2 border-ink rounded-lg px-2 py-1 text-xs font-bold focus:outline-none cursor-pointer"
              >
                <option value="closing_soon">⚡ Closing Soonest</option>
                <option value="prize_high">🏆 Prize (High to Low)</option>
                <option value="newest">✨ Recently Added</option>
              </select>
            </div>
          </div>

          {/* Active Chips */}
          <ActiveFilterChips
            filters={activeFilters}
            onFilterChange={updateFilters}
            onReset={resetAllFilters}
          />

          {/* Hackathon Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="retro-card p-5 h-64 animate-pulse bg-white space-y-4"
                >
                  <div className="h-4 w-24 bg-parchment rounded" />
                  <div className="h-6 w-3/4 bg-parchment rounded" />
                  <div className="h-4 w-1/2 bg-parchment rounded" />
                  <div className="h-10 bg-parchment/60 rounded-xl" />
                </div>
              ))}
            </div>
          ) : !data || data.hackathons.length === 0 ? (
            <EmptyState onReset={resetAllFilters} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.hackathons.map((hackathon) => (
                <HackathonCard
                  key={hackathon.id}
                  hackathon={hackathon}
                  className="h-full"
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={data.page <= 1}
                onClick={() => updateFilters({ page: data.page - 1 })}
              >
                Previous
              </Button>
              <span className="text-xs font-bold px-3 py-1 bg-white border border-ink rounded-lg">
                Page {data.page} of {data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={data.page >= data.totalPages}
                onClick={() => updateFilters({ page: data.page + 1 })}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Sheet Modal */}
      <MobileFilterSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        filters={activeFilters}
        onFilterChange={updateFilters}
        onReset={resetAllFilters}
        totalResults={data?.total || 0}
      />
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center py-20 text-sm font-bold">
          Loading SideQuest Radar...
        </div>
      }
    >
      <DiscoverContent />
    </Suspense>
  );
}
