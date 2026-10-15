import {
  Hackathon as DbHackathon,
  FeeType,
  Scope,
  OrganizerType,
  DataConfidence,
} from "./types";
import { generateIcsFeed } from "./ics";

export type Mode = "online" | "offline" | "hybrid";
export type Status = "upcoming" | "open" | "closing-soon" | "closed";

export interface HackathonUI {
  id: string;
  source_id?: string;
  title: string;
  organizer: string;
  organizer_type: OrganizerType;
  scope: Scope;
  source: string;
  source_url: string;
  official_page?: string | null;
  apply_url?: string | null;
  mode: Mode;
  country?: string | null;
  city?: string | null;
  state?: string | null;
  venue?: string | null;
  lat?: number | null;
  lng?: number | null;
  tags: string[];
  prize_amount_inr: number;
  prize_amount?: number | null;
  prize_currency?: string | null;
  prize_text?: string | null;
  team_min?: number | null;
  team_max?: number | null;
  team_note?: string | null;
  reg_start?: string | null;
  reg_deadline?: string | null;
  deadline_note?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  eligibility: string;
  eligibility_text?: string | null;
  description: string;
  is_sample?: boolean;
  fee_type: FeeType;
  fee_amount_inr?: number | null;
  data_confidence: DataConfidence;
  last_verified_at?: string | null;
  needs_review?: boolean;
  deadline_precision?: "date" | "exact";
  scope_assumed?: boolean;
  hidden?: boolean;
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

  // V2 Filters
  price?: "all" | "free" | "paid" | undefined;
  scope?: "global" | "national" | "state" | "nearby" | undefined;
  user_state?: string | undefined;
  radius_km?: number | undefined;
  user_lat?: number | undefined;
  user_lng?: number | undefined;
  organizer_types?: OrganizerType[] | undefined;
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

export const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  delhi: { lat: 28.6139, lng: 77.209 },
  "new delhi": { lat: 28.6139, lng: 77.209 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  pune: { lat: 18.5204, lng: 73.8567 },
  hyderabad: { lat: 17.385, lng: 78.4867 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  berlin: { lat: 52.52, lng: 13.405 },
};

/**
 * Computes Haversine distance in kilometers between two coordinates.
 */
export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function getStatus(
  event: Pick<HackathonUI, "reg_start" | "reg_deadline">,
  now: number
): Status {
  if (!event.reg_deadline) return "open";
  const deadline = Date.parse(event.reg_deadline);
  if (isNaN(deadline)) return "open";

  const start = event.reg_start ? Date.parse(event.reg_start) : NaN;

  if (now >= deadline) return "closed";
  if (!isNaN(start) && now < start) return "upcoming";
  if (deadline - now <= 72 * HOUR) return "closing-soon";
  return "open";
}

export function countdown(event: HackathonUI, now: number) {
  if (event.needs_review || !event.reg_deadline) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      status: "open" as Status,
      hasDeadline: false,
    };
  }

  const status = getStatus(event, now);
  const target = Date.parse(
    status === "upcoming" && event.reg_start ? event.reg_start : event.reg_deadline
  );

  if (isNaN(target)) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      status,
      hasDeadline: false,
    };
  }

  const seconds = Math.max(0, Math.floor((target - now) / 1000));
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor(seconds / 3600) % 24,
    minutes: Math.floor(seconds / 60) % 60,
    seconds: seconds % 60,
    status,
    hasDeadline: true,
  };
}

export function statusLabel(event: HackathonUI, now: number) {
  if (event.needs_review || !event.reg_deadline) {
    return "Check source";
  }
  const status = getStatus(event, now);
  if (
    status === "closing-soon" &&
    event.reg_deadline &&
    Date.parse(event.reg_deadline) - now <= 24 * HOUR
  ) {
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

export function formatFee(event: Pick<HackathonUI, "fee_type" | "fee_amount_inr">) {
  if (event.fee_type === "free") return "Free";
  if (event.fee_type === "paid") {
    return event.fee_amount_inr
      ? `₹${event.fee_amount_inr.toLocaleString("en-IN")}`
      : "Paid";
  }
  return "Fee not stated";
}

export function formatDate(date?: string | null) {
  if (!date) return "Date not stated";
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-IN", {
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

export function toGoogleCalendar(event: HackathonUI): string {
  const { generateGoogleCalendarUrl } = require("./ics");
  return generateGoogleCalendarUrl(event as any);
}

export function activeFilterCount(filters: DiscoveryFilters) {
  return (
    Number(Boolean(filters.q)) +
    Number(Boolean(filters.mode)) +
    Number(Boolean(filters.status)) +
    Number(Boolean(filters.city)) +
    Number(Boolean(filters.prize)) +
    (filters.tags?.length ?? 0) +
    Number(Boolean(filters.students)) +
    Number(Boolean(filters.price && filters.price !== "all")) +
    Number(Boolean(filters.scope)) +
    (filters.organizer_types?.length ?? 0)
  );
}

export function filterHackathons(
  events: HackathonUI[],
  filters: DiscoveryFilters,
  now: number
) {
  const q = filters.q?.trim().toLowerCase() ?? "";
  const tags = filters.tags ?? [];
  const organizerTypes = filters.organizer_types ?? [];

  const results = events.filter((e) => {
    // 1. Text search
    const matchesQ =
      !q ||
      [
        e.title,
        e.organizer,
        e.city || "",
        e.state || "",
        e.country || "",
        e.eligibility || "",
        e.eligibility_text || "",
        ...e.tags,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);

    // 2. Mode
    const matchesMode = !filters.mode || e.mode === filters.mode;

    // 3. City
    const matchesCity =
      !filters.city ||
      (e.city && e.city.toLowerCase() === filters.city.toLowerCase()) ||
      (filters.city === "Pan India" && (!e.city || e.mode === "online"));

    // 4. Status
    const matchesStatus = !filters.status || getStatus(e, now) === filters.status;

    // 5. Prize
    const matchesPrize = e.prize_amount_inr >= (filters.prize ?? 0);

    // 6. Tags
    const matchesTags = tags.length === 0 || tags.every((tag) => e.tags.includes(tag));

    // 7. Students
    const matchesStudents =
      !filters.students ||
      e.eligibility.toLowerCase().includes("student") ||
      (e.eligibility_text && e.eligibility_text.toLowerCase().includes("student")) ||
      e.eligibility === "College students only";

    // 8. Price filter (v2)
    // "Free" matches only fee_type = 'free'. "Paid" matches fee_type = 'paid'. "All" includes unknown.
    let matchesPrice = true;
    if (filters.price === "free") {
      matchesPrice = e.fee_type === "free";
    } else if (filters.price === "paid") {
      matchesPrice = e.fee_type === "paid";
    }

    // 9. Scope filter (v2)
    let matchesScope = true;
    if (filters.scope === "global") {
      matchesScope = e.scope === "global";
    } else if (filters.scope === "national") {
      matchesScope =
        e.scope === "national" ||
        (e.scope === "global" && (!e.country || e.country.toLowerCase() === "india"));
    } else if (filters.scope === "state") {
      if (filters.user_state) {
        matchesScope =
          e.scope === "state" &&
          Boolean(e.state && e.state.toLowerCase() === filters.user_state.toLowerCase());
      } else {
        matchesScope = e.scope === "state";
      }
    } else if (filters.scope === "nearby") {
      // Offline/hybrid only; online events are never nearby
      if (e.mode === "online") {
        matchesScope = false;
      } else {
        const radius = filters.radius_km || 100;
        let uLat = filters.user_lat;
        let uLng = filters.user_lng;

        if (uLat === undefined || uLng === undefined) {
          const fallbackCity = filters.city?.toLowerCase();
          if (fallbackCity && CITY_COORDINATES[fallbackCity]) {
            uLat = CITY_COORDINATES[fallbackCity].lat;
            uLng = CITY_COORDINATES[fallbackCity].lng;
          }
        }

        let eLat = e.lat;
        let eLng = e.lng;
        if ((eLat === null || eLat === undefined) && e.city) {
          const coord = CITY_COORDINATES[e.city.toLowerCase()];
          if (coord) {
            eLat = coord.lat;
            eLng = coord.lng;
          }
        }

        if (
          uLat !== undefined &&
          uLng !== undefined &&
          eLat !== null &&
          eLat !== undefined &&
          eLng !== null &&
          eLng !== undefined
        ) {
          const distance = haversineDistanceKm(uLat, uLng, eLat, eLng);
          matchesScope = distance <= radius;
        } else if (filters.city && e.city) {
          matchesScope = e.city.toLowerCase() === filters.city.toLowerCase();
        } else {
          // If no location context available, only match offline in same location
          matchesScope = false;
        }
      }
    }

    // 10. Organizer Type filter (v2 multi-select)
    const matchesOrganizer =
      organizerTypes.length === 0 || organizerTypes.includes(e.organizer_type);

    return (
      matchesQ &&
      matchesMode &&
      matchesCity &&
      matchesStatus &&
      matchesPrize &&
      matchesTags &&
      matchesStudents &&
      matchesPrice &&
      matchesScope &&
      matchesOrganizer
    );
  });

  // Best Match ranking excludes unverified rows per spec
  let sortableResults = results;
  if (filters.sort === "match") {
    sortableResults = results.filter((e) => e.data_confidence !== "unverified");
  }

  const match = (e: HackathonUI) =>
    tags.filter((t) => e.tags.includes(t)).length * 10 +
    (q && e.title.toLowerCase().includes(q) ? 20 : 0) +
    (getStatus(e, now) === "closed" ? 0 : 5);

  return sortableResults.sort((a, b) => {
    if (filters.sort === "prize") return b.prize_amount_inr - a.prize_amount_inr;
    if (filters.sort === "match" && match(a) !== match(b)) return match(b) - match(a);

    const rank = (e: HackathonUI) =>
      getStatus(e, now) === "closed" ? 2 : getStatus(e, now) === "upcoming" ? 1 : 0;

    const rankDiff = rank(a) - rank(b);
    if (rankDiff !== 0) return rankDiff;

    const aTime = a.reg_deadline ? Date.parse(a.reg_deadline) : Infinity;
    const bTime = b.reg_deadline ? Date.parse(b.reg_deadline) : Infinity;
    return aTime - bTime;
  });
}

/**
 * Normalizes DbHackathon into HackathonUI
 */
export function normalizeHackathon(h: DbHackathon): HackathonUI {
  const city = h.city ?? (h.mode === "online" ? "Pan India" : null);
  const cityKey = city ? city.toLowerCase() : "";
  const fallbackCoords = CITY_COORDINATES[cityKey];

  return {
    id: h.id,
    source_id: h.source_id,
    title: h.title,
    organizer: h.organizer,
    organizer_type: h.organizer_type || "company",
    scope: h.scope || "global",
    fee_type: h.fee_type || "unknown",
    fee_amount_inr: h.fee_amount_inr ?? null,
    source: h.source.startsWith("via ") ? h.source : `via ${h.source}`,
    source_url: h.source_url,
    official_page: h.official_page || null,
    apply_url: h.apply_url || null,
    mode: h.mode,
    country: h.country || null,
    city: city || "Pan India",
    state: h.state || null,
    venue: h.venue || null,
    lat: h.lat ?? fallbackCoords?.lat ?? null,
    lng: h.lng ?? fallbackCoords?.lng ?? null,
    tags: h.tags ?? [],
    prize_amount_inr: h.prize_amount_inr ?? 0,
    prize_amount: h.prize_amount ?? null,
    prize_currency: h.prize_currency ?? null,
    prize_text: h.prize_text ?? null,
    team_min: h.team_min ?? 1,
    team_max: h.team_max ?? null,
    team_note: h.team_note ?? null,
    reg_start: h.reg_start || null,
    reg_deadline: h.reg_deadline || null,
    deadline_note: h.deadline_note || null,
    start_date: h.start_date || null,
    end_date: h.end_date || null,
    eligibility:
      h.eligibility_text ||
      (typeof h.eligibility === "object" && h.eligibility?.students_only
        ? "College students only"
        : "Open to everyone"),
    eligibility_text: h.eligibility_text || null,
    description: h.description || h.summary || "No description provided.",
    data_confidence: h.data_confidence || (h.verified ? "verified_primary" : "unverified"),
    last_verified_at: h.last_verified_at || null,
    needs_review: Boolean(h.needs_review),
    deadline_precision: h.deadline_precision || (h.reg_deadline && h.reg_deadline.length <= 10 ? "date" : "exact"),
    scope_assumed: Boolean(h.scope_assumed),
    hidden: Boolean(h.hidden),
    is_sample:
      !h.verified && (h.title.includes("[SAMPLE]") || h.source_id.startsWith("seed-")),
  };
}
