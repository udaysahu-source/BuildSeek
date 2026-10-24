import { getLocalDataset } from "@/lib/db/hackathons";
import { Hackathon, HackathonStatus } from "@/lib/types";
import { computeHackathonStatus } from "@/lib/status";
import { isSupabaseConfigured, getSupabaseClient } from "@/lib/supabase";
import { PUBLIC_HACKATHON_COLUMNS, scrubHackathon } from "@/lib/security/privacy";
import { logger } from "@/lib/security/logger";

// Local in-memory store for guest/fallback bookmarks
const inMemoryBookmarks = new Set<string>([
  // Initial bookmarked item: OpenCV AI Competition 2026
  "c1000000-0000-0000-0000-000000000001",
]);

export async function getUserBookmarkedHackathons(
  userId?: string
): Promise<(Hackathon & { status: HackathonStatus })[]> {
  if (isSupabaseConfigured && userId) {
    try {
      const supabase = getSupabaseClient();
      const { data: bms, error } = await supabase
        .from("bookmarks")
        .select("hackathon_id")
        .eq("user_id", userId);

      if (!error && bms) {
        const ids = bms.map((b) => b.hackathon_id);
        const { data: hackathons } = await supabase
          .from("hackathons")
          .select(PUBLIC_HACKATHON_COLUMNS)
          .in("id", ids);

        if (hackathons) {
          return (hackathons as unknown as Hackathon[]).map((h: Hackathon) => ({
            ...scrubHackathon(h),
            status: computeHackathonStatus(h.reg_start, h.reg_deadline),
            is_bookmarked: true,
          })) as (Hackathon & { status: HackathonStatus })[];
        }
      }
    } catch (err) {
      logger.warn("Supabase bookmarks fetch failed, using fallback", err, undefined, "bookmarks");
    }
  }

  // Fallback to in-memory items from live dataset
  const dataset = getLocalDataset();
  return dataset.filter((h) => inMemoryBookmarks.has(h.id)).map(
    (h) => ({
      ...h,
      status: computeHackathonStatus(h.reg_start, h.reg_deadline),
      is_bookmarked: true,
    })
  );
}

export async function toggleBookmark(
  hackathonId: string,
  userId?: string
): Promise<{ bookmarked: boolean }> {
  if (isSupabaseConfigured && userId) {
    try {
      const supabase = getSupabaseClient();
      const { data: existing } = await supabase
        .from("bookmarks")
        .select("id")
        .eq("user_id", userId)
        .eq("hackathon_id", hackathonId)
        .single();

      if (existing) {
        await supabase
          .from("bookmarks")
          .delete()
          .eq("user_id", userId)
          .eq("hackathon_id", hackathonId);
        return { bookmarked: false };
      } else {
        await supabase
          .from("bookmarks")
          .insert({ user_id: userId, hackathon_id: hackathonId });
        return { bookmarked: true };
      }
    } catch (err) {
      logger.warn("Supabase toggle bookmark failed, using fallback", err, undefined, "bookmarks");
    }
  }

  // Local fallback toggle
  if (inMemoryBookmarks.has(hackathonId)) {
    inMemoryBookmarks.delete(hackathonId);
    return { bookmarked: false };
  } else {
    inMemoryBookmarks.add(hackathonId);
    return { bookmarked: true };
  }
}
