import { Hackathon, HackathonStatus } from "@/lib/types";
import { computeHackathonStatus } from "@/lib/status";
import { SEED_HACKATHONS } from "@/seed/hackathons";

export interface HackathonFilterOptions {
  q?: string | null;
  mode?: "online" | "offline" | "hybrid" | null;
  city?: string | null;
  status?: HackathonStatus | "all" | null;
  tags?: string[] | null;
  prize_min?: number | null;
  team_max?: number | null;
  include_closed?: boolean;
  sort?: "closing_soon" | "newest" | "prize_high" | "deadline" | "match" | null;
  page?: number;
  limit?: number;

  // V2 Filters
  price?: "all" | "free" | "paid" | null;
  fee_type?: "free" | "paid" | "unknown" | "all" | null;
  scope?: "global" | "national" | "state" | "city" | "college" | "nearby" | null;
  organizer_types?: (
    | "government"
    | "company"
    | "college"
    | "community"
    | "nonprofit"
    | "other"
  )[] | null;
  lat?: number | null;
  lng?: number | null;
  radius_km?: number | null;
  user_state?: string | null;
}

export interface HackathonListResult {
  hackathons: (Hackathon & { status: HackathonStatus })[];
  total: number;
  page: number;
  totalPages: number;
}

let cachedDataset: Hackathon[] | null = null;

export function getLocalDataset(): Hackathon[] {
  if (cachedDataset) return cachedDataset;

  if (typeof window === "undefined") {
    try {
      const nodeRequire = (globalThis as any).require;
      if (nodeRequire) {
        const fs = nodeRequire("fs");
        const path = nodeRequire("path");
        const dataPath = path.join(process.cwd(), "data/hackathons.json");
        if (fs.existsSync(dataPath)) {
          const content = fs.readFileSync(dataPath, "utf-8");
          const parsed = JSON.parse(content);
          const list: Hackathon[] = Array.isArray(parsed)
            ? parsed
            : Array.isArray(parsed?.hackathons)
            ? parsed.hackathons
            : [];
          if (list.length > 0) {
            const existingIds = new Set(list.map((h: Hackathon) => h.id));
            const combined = [...list];
            for (const seed of SEED_HACKATHONS) {
              if (!existingIds.has(seed.id)) {
                combined.push(seed);
              }
            }
            cachedDataset = combined;
            return combined;
          }
        }
      }
    } catch (e) {
      // browser / client fallback
    }
  }

  cachedDataset = SEED_HACKATHONS;
  return SEED_HACKATHONS;
}

/**
 * In-memory / Mock / Fallback query engine mirroring Supabase FTS and GIN filters.
 */
export async function getHackathons(
  filters: HackathonFilterOptions = {}
): Promise<HackathonListResult> {
  const page = Math.max(1, filters.page || 1);
  const limit = Math.max(1, Math.min(100, filters.limit || 20));

  // In production with Supabase configured:
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isSupabaseConfigured =
    supabaseUrl && !supabaseUrl.includes("your-project.supabase.co");

  if (isSupabaseConfigured) {
    try {
      // Connect to real Supabase client dynamically
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        supabaseUrl,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      let query = supabase.from("hackathons").select("*", { count: "exact" });

      if (filters.q) {
        query = query.textSearch("fts", filters.q, {
          type: "websearch",
          config: "english",
        });
      }
      if (filters.mode) {
        query = query.eq("mode", filters.mode);
      }
      if (filters.city) {
        query = query.ilike("city", `%${filters.city}%`);
      }
      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps("tags", filters.tags);
      }
      if (filters.prize_min) {
        query = query.gte("prize_amount_inr", filters.prize_min);
      }
      if (filters.team_max) {
        query = query.lte("team_max", filters.team_max);
      }

      if (!filters.include_closed) {
        query = query.gte("reg_deadline", new Date().toISOString());
      }

      // Order
      if (filters.sort === "prize_high") {
        query = query.order("prize_amount_inr", { ascending: false });
      } else if (filters.sort === "newest") {
        query = query.order("created_at", { ascending: false });
      } else {
        query = query.order("reg_deadline", { ascending: true });
      }

      const offset = (page - 1) * limit;
      const { data, count, error } = await query.range(
        offset,
        offset + limit - 1
      );

      if (!error && data) {
        const enriched = data.map((h: Hackathon) => ({
          ...h,
          status: computeHackathonStatus(h.reg_start, h.reg_deadline),
        }));

        const total = count || enriched.length;
        return {
          hackathons: enriched,
          total,
          page,
          totalPages: Math.ceil(total / limit),
        };
      }
    } catch (err) {
      console.warn("Supabase query failed, falling back to local dataset:", err);
    }
  }

  // Local In-memory Query Engine
  const now = new Date();
  let results = getLocalDataset()
    .filter((h) => !h.hidden)
    .map((h) => ({
      ...h,
      status: computeHackathonStatus(h.reg_start, h.reg_deadline, now),
    }));

  // Filter: Keyword Search (title, organizer, summary, description)
  if (filters.q && filters.q.trim().length > 0) {
    const terms = filters.q.toLowerCase().split(/\s+/).filter(Boolean);
    results = results.filter((h) => {
      const haystack = `${h.title} ${h.organizer} ${h.summary || ""} ${h.description || ""} ${h.tags.join(" ")}`.toLowerCase();
      return terms.every((term) => haystack.includes(term));
    });
  }

  // Filter: Mode
  if (filters.mode) {
    results = results.filter((h) => h.mode === filters.mode);
  }

  // Filter: City
  if (filters.city && filters.city.trim().length > 0) {
    const cityLower = filters.city.toLowerCase();
    results = results.filter(
      (h) => h.city && h.city.toLowerCase().includes(cityLower)
    );
  }

  // Filter: Status
  if (filters.status && filters.status !== "all") {
    results = results.filter((h) => h.status === filters.status);
  } else if (!filters.include_closed) {
    // Hide closed by default per requirement FR-6
    results = results.filter((h) => h.status !== "closed");
  }

  // Filter: Tags (array overlap)
  if (filters.tags && filters.tags.length > 0) {
    const filterTagsLower = filters.tags.map((t) => t.toLowerCase());
    results = results.filter((h) =>
      h.tags.some((t) => filterTagsLower.includes(t.toLowerCase()))
    );
  }

  // Filter: Prize Min
  if (filters.prize_min && filters.prize_min > 0) {
    results = results.filter(
      (h) => (h.prize_amount_inr || 0) >= filters.prize_min!
    );
  }

  // Filter: Team Max
  if (filters.team_max) {
    results = results.filter((h) => (h.team_max ?? 4) <= filters.team_max!);
  }

  // Filter: Fee Type / Price (v2)
  if (filters.fee_type === "free" || filters.price === "free") {
    results = results.filter((h) => h.fee_type === "free");
  } else if (filters.fee_type === "paid" || filters.price === "paid") {
    results = results.filter((h) => h.fee_type === "paid");
  }

  // Filter: Scope (v2)
  if (filters.scope === "global") {
    results = results.filter((h) => h.scope === "global");
  } else if (filters.scope === "national") {
    results = results.filter(
      (h) =>
        h.scope === "national" ||
        (h.scope === "global" && (!h.country || h.country.toLowerCase() === "india"))
    );
  } else if (filters.scope === "state") {
    if (filters.user_state) {
      results = results.filter(
        (h) =>
          h.scope === "state" &&
          Boolean(h.state && h.state.toLowerCase() === filters.user_state!.toLowerCase())
      );
    } else {
      results = results.filter((h) => h.scope === "state");
    }
  } else if (filters.scope === "nearby") {
    // Nearby: offline/hybrid only, within radius
    const radius = filters.radius_km || 100;
    results = results.filter((h) => {
      if (h.mode === "online") return false;
      if (filters.lat !== undefined && filters.lat !== null && filters.lng !== undefined && filters.lng !== null && h.lat && h.lng) {
        // Simple haversine approximation for query engine
        const R = 6371;
        const dLat = (h.lat - filters.lat) * (Math.PI / 180);
        const dLon = (h.lng - filters.lng) * (Math.PI / 180);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(filters.lat * (Math.PI / 180)) *
            Math.cos(h.lat * (Math.PI / 180)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return d <= radius;
      }
      if (filters.city && h.city) {
        return h.city.toLowerCase().includes(filters.city.toLowerCase());
      }
      return false;
    });
  }

  // Filter: Organizer Type (v2)
  if (filters.organizer_types && filters.organizer_types.length > 0) {
    results = results.filter((h) =>
      filters.organizer_types!.includes(h.organizer_type || "company")
    );
  }

  // Sorting
  if (filters.sort === "prize_high") {
    results.sort((a, b) => (b.prize_amount_inr || 0) - (a.prize_amount_inr || 0));
  } else if (filters.sort === "newest") {
    results.sort(
      (a, b) =>
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );
  } else if (filters.sort === "match") {
    // Best match excludes unverified rows
    results = results.filter((h) => h.data_confidence !== "unverified");
    results.sort((a, b) => (b.prize_amount_inr || 0) - (a.prize_amount_inr || 0));
  } else {
    // Default: closing_soon / ascending deadline
    results.sort((a, b) => {
      const aTime = a.reg_deadline ? new Date(a.reg_deadline).getTime() : Infinity;
      const bTime = b.reg_deadline ? new Date(b.reg_deadline).getTime() : Infinity;
      return aTime - bTime;
    });
  }

  const total = results.length;
  const offset = (page - 1) * limit;
  const paginated = results.slice(offset, offset + limit);

  return {
    hackathons: paginated,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

/**
 * Retrieves a single hackathon by ID.
 */
export async function getHackathonById(
  id: string
): Promise<(Hackathon & { status: HackathonStatus }) | null> {
  const item = getLocalDataset().find((h) => h.id === id);
  if (!item) return null;

  return {
    ...item,
    status: computeHackathonStatus(item.reg_start, item.reg_deadline),
  };
}
