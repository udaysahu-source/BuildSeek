import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUserBookmarkedHackathons } from "@/lib/db/bookmarks";
import { generateIcsFeed } from "@/lib/ics";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/security/rate-limit";
import { isSupabaseConfigured, getSupabaseClient } from "@/lib/supabase";

const CalendarTokenSchema = z
  .string()
  .trim()
  .min(8, "Token too short")
  .max(128, "Token too long")
  .regex(/^[a-zA-Z0-9_-]+$/, "Invalid token format");

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  // 1. Rate Limiting: 60 requests per hour per IP
  const ip = getClientIp(request);
  const rl = checkRateLimit(ip, {
    limit: 60,
    windowMs: 60 * 60 * 1000,
    keyPrefix: "cal_feed",
  });

  if (!rl.allowed) {
    return rateLimitResponse(rl.resetAt);
  }

  // 2. Strict Input Validation
  const resolvedParams = await params;
  const parsed = CalendarTokenSchema.safeParse(resolvedParams.token);

  if (!parsed.success) {
    return new NextResponse("Invalid calendar token format", { status: 400 });
  }

  const token = parsed.data;
  let targetUserId: string | undefined = undefined;

  // 3. Authenticate and resolve user associated with calendar_token
  if (isSupabaseConfigured) {
    try {
      const supabase = getSupabaseClient();
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("calendar_token", token)
        .single();

      if (error || !profile) {
        return new NextResponse("Calendar feed not found", { status: 404 });
      }

      targetUserId = profile.id;
    } catch {
      return new NextResponse("Calendar feed service error", { status: 500 });
    }
  }

  // Fetch bookmarked hackathons specifically for this verified user
  const bookmarked = await getUserBookmarkedHackathons(targetUserId);
  const icsBody = generateIcsFeed(bookmarked);

  return new NextResponse(icsBody, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="sidequest-hackathons.ics"',
      "Cache-Control": "private, max-age=3600, stale-while-revalidate=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
