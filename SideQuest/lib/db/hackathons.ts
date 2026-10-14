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
  sort?: "closing_soon" | "newest" | "prize_high" | "deadline" | null;
  page?: number;
  limit?: number;
}

export interface HackathonListResult {
  hackathons: (Hackathon & { status: HackathonStatus })[];
  total: number;
  page: number;
  totalPages: number;
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
  let results = SEED_HACKATHONS.map((h) => ({
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
    results = results.filter((h) => h.team_max <= filters.team_max!);
  }

  // Sorting
  if (filters.sort === "prize_high") {
    results.sort((a, b) => (b.prize_amount_inr || 0) - (a.prize_amount_inr || 0));
  } else if (filters.sort === "newest") {
    results.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } else {
    // Default: closing_soon / ascending deadline
    results.sort(
      (a, b) =>
        new Date(a.reg_deadline).getTime() - new Date(b.reg_deadline).getTime()
    );
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
  const item = SEED_HACKATHONS.find((h) => h.id === id);
  if (!item) return null;

  return {
    ...item,
    status: computeHackathonStatus(item.reg_start, item.reg_deadline),
  };
}
