import { Hackathon as DbHackathon } from "./types";
import { generateIcsFeed } from "./ics";

export type Mode = "online" | "offline" | "hybrid";
export type Status = "upcoming" | "open" | "closing-soon" | "closed";

export interface HackathonUI {
  id: string;
  title: string;
  organizer: string;
  source: string;
  source_url: string;
  mode: Mode;
  city: string;
  tags: string[];
  prize_amount_inr: number;
  team_min: number;
  team_max: number;
  reg_start: string;
  reg_deadline: string;
  start_date: string;
  end_date: string;
  eligibility: string;
  description: string;
  is_sample?: boolean;
}

export type Hackathon = HackathonUI;

export interface DiscoveryFilters {
  q?: string | undefined;
  mode?: Mode | undefined;
  status?: Status | undefined;
  city?: string | undefined;
  prize?: number | undefined;
  tags?: string[] | undefined;
  students?: boolean | undefined;
  sort?: "closing" | "match" | "prize" | undefined;
  page?: number | undefined;
  event?: string | undefined;
}

export const HOUR = 3_600_000;
export const THEMES = [
  "AI / ML",
  "Web development",
  "Sustainability",
  "Fintech",
  "Healthtech",
  "Open innovation",
  "Blockchain",
];

export const CITIES = [
  "Pan India",
  "Bengaluru",
  "Delhi",
  "Mumbai",
  "Pune",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Jaipur",
];

export function getStatus(
  event: Pick<HackathonUI, "reg_start" | "reg_deadline">,
  now: number
): Status {
  const deadline = Date.parse(event.reg_deadline);
  const start = Date.parse(event.reg_start);

  if (now >= deadline) return "closed";
  if (now < start) return "upcoming";
  if (deadline - now <= 72 * HOUR) return "closing-soon";
  return "open";
}

export function countdown(event: HackathonUI, now: number) {
  const status = getStatus(event, now);
  const target = Date.parse(status === "upcoming" ? event.reg_start : event.reg_deadline);
  const seconds = Math.max(0, Math.floor((target - now) / 1000));
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor(seconds / 3600) % 24,
    minutes: Math.floor(seconds / 60) % 60,
    seconds: seconds % 60,
    status,
  };
}

export function statusLabel(event: HackathonUI, now: number) {
  const status = getStatus(event, now);
  if (status === "closing-soon" && Date.parse(event.reg_deadline) - now <= 24 * HOUR) {
    return "Closes today";
  }
  return {
    upcoming: "Opens soon",
    open: "Registration open",
    "closing-soon": "Closing soon",
    closed: "Registration closed",
  }[status];
}

export function formatPrize(amount?: number | null) {
  return amount ? `₹${amount.toLocaleString("en-IN")}` : "No cash prize";
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

export function toCalendar(event: HackathonUI): string {
  // Use existing RFC 5545 generator
  return generateIcsFeed([event as any], event.title);
}

export function activeFilterCount(filters: DiscoveryFilters) {
  return (
    Number(Boolean(filters.q)) +
    Number(Boolean(filters.mode)) +
    Number(Boolean(filters.status)) +
    Number(Boolean(filters.city)) +
    Number(Boolean(filters.prize)) +
    (filters.tags?.length ?? 0) +
    Number(Boolean(filters.students))
  );
}

export function filterHackathons(events: HackathonUI[], filters: DiscoveryFilters, now: number) {
  const q = filters.q?.trim().toLowerCase() ?? "";
  const tags = filters.tags ?? [];

  const results = events.filter((e) => {
    const matchesQ =
      !q ||
      [e.title, e.organizer, e.city, ...e.tags]
        .join(" ")
        .toLowerCase()
        .includes(q);
    const matchesMode = !filters.mode || e.mode === filters.mode;
    const matchesCity = !filters.city || e.city === filters.city;
    const matchesStatus = !filters.status || getStatus(e, now) === filters.status;
    const matchesPrize = e.prize_amount_inr >= (filters.prize ?? 0);
    const matchesTags = tags.every((tag) => e.tags.includes(tag));
    const matchesStudents =
      !filters.students ||
      e.eligibility.toLowerCase().includes("student") ||
      e.eligibility === "College students only";

    return (
      matchesQ &&
      matchesMode &&
      matchesCity &&
      matchesStatus &&
      matchesPrize &&
      matchesTags &&
      matchesStudents
    );
  });

  const match = (e: HackathonUI) =>
    tags.filter((t) => e.tags.includes(t)).length * 10 +
    (q && e.title.toLowerCase().includes(q) ? 20 : 0) +
    (getStatus(e, now) === "closed" ? 0 : 5);

  return results.sort((a, b) => {
    if (filters.sort === "prize") return b.prize_amount_inr - a.prize_amount_inr;
    if (filters.sort === "match" && match(a) !== match(b)) return match(b) - match(a);
    const rank = (e: HackathonUI) =>
      getStatus(e, now) === "closed" ? 2 : getStatus(e, now) === "upcoming" ? 1 : 0;
    return rank(a) - rank(b) || Date.parse(a.reg_deadline) - Date.parse(b.reg_deadline);
  });
}

/**
 * Normalizes DbHackathon into HackathonUI
 */
export function normalizeHackathon(h: DbHackathon): HackathonUI {
  return {
    id: h.id,
    title: h.title,
    organizer: h.organizer,
    source: h.source.startsWith("via ") ? h.source : `via ${h.source}`,
    source_url: h.source_url,
    mode: h.mode,
    city: h.city ?? "Pan India",
    tags: h.tags ?? [],
    prize_amount_inr: h.prize_amount_inr ?? 0,
    team_min: h.team_min ?? 1,
    team_max: h.team_max ?? 4,
    reg_start: h.reg_start,
    reg_deadline: h.reg_deadline,
    start_date: h.start_date,
    end_date: h.end_date,
    eligibility: typeof h.eligibility === "object" && h.eligibility?.students_only
      ? "College students only"
      : typeof h.eligibility === "string"
      ? h.eligibility
      : "Open to everyone",
    description: h.description || h.summary || "No description provided.",
    is_sample: !h.verified,
  };
}
