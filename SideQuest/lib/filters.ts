import { HackathonFilterOptions } from "./db/hackathons";
import { HackathonMode, HackathonStatus } from "./types";

export function parseSearchParamsToFilters(
  searchParams: Record<string, string | string[] | undefined>
): HackathonFilterOptions {
  const getSingle = (key: string): string | undefined => {
    const val = searchParams[key];
    if (Array.isArray(val)) return val[0];
    return val;
  };

  const q = getSingle("q") || null;
  const mode = (getSingle("mode") as HackathonMode) || null;
  const city = getSingle("city") || null;
  const status = (getSingle("status") as HackathonStatus | "all") || null;
  const tagsParam = getSingle("tags");
  const tags = tagsParam ? tagsParam.split(",").filter(Boolean) : null;
  const prize_min = getSingle("prize_min")
    ? parseInt(getSingle("prize_min")!, 10)
    : null;
  const team_max = getSingle("team_max")
    ? parseInt(getSingle("team_max")!, 10)
    : null;
  const include_closed = getSingle("include_closed") === "true";
  const sort = (getSingle("sort") as HackathonFilterOptions["sort"]) || "closing_soon";
  const page = getSingle("page") ? parseInt(getSingle("page")!, 10) : 1;

  return {
    q,
    mode,
    city,
    status,
    tags,
    prize_min,
    team_max,
    include_closed,
    sort,
    page,
    limit: 20,
  };
}

export function filtersToQueryString(
  filters: Partial<HackathonFilterOptions>
): string {
  const params = new URLSearchParams();

  if (filters.q) params.set("q", filters.q.trim());
  if (filters.mode) params.set("mode", filters.mode);
  if (filters.city) params.set("city", filters.city.trim());
  if (filters.status && filters.status !== "all") params.set("status", filters.status);
  if (filters.tags && filters.tags.length > 0) params.set("tags", filters.tags.join(","));
  if (filters.prize_min) params.set("prize_min", filters.prize_min.toString());
  if (filters.team_max) params.set("team_max", filters.team_max.toString());
  if (filters.include_closed) params.set("include_closed", "true");
  if (filters.sort && filters.sort !== "closing_soon") params.set("sort", filters.sort);
  if (filters.page && filters.page > 1) params.set("page", filters.page.toString());

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}
