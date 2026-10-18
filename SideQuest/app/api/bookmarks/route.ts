import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUserBookmarkedHackathons, toggleBookmark } from "@/lib/db/bookmarks";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/security/rate-limit";

const ToggleBookmarkSchema = z
  .object({
    hackathonId: z.string().min(1, "hackathonId is required").max(64),
  })
  .strict();

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(ip, { limit: 60, windowMs: 60_000, keyPrefix: "bookmarks_get" });
  if (!rl.allowed) {
    return rateLimitResponse(rl.resetAt);
  }

  // Retrieve authenticated user from session
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Sign in required to view user bookmarks" },
      { status: 401 }
    );
  }

  const bookmarks = await getUserBookmarkedHackathons(user.id);
  return NextResponse.json({ bookmarks });
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(ip, { limit: 30, windowMs: 60_000, keyPrefix: "bookmarks_toggle" });
  if (!rl.allowed) {
    return rateLimitResponse(rl.resetAt);
  }

  // 1. Authenticate user - prevent Broken Object Level Authorization (BOLA)
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Sign in required to toggle bookmarks" },
      { status: 401 }
    );
  }

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    // 2. Strict Zod Schema Validation (disallow extra fields like injected userId)
    const parsed = ToggleBookmarkSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // 3. Always use authenticated user's ID, never client-supplied ID
    const { hackathonId } = parsed.data;
    const result = await toggleBookmark(hackathonId, user.id);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to update bookmark" },
      { status: 500 }
    );
  }
}
