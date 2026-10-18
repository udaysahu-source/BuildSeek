import { NextResponse } from "next/server";
import { isSupabaseConfigured, getSupabaseClient } from "@/lib/supabase";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // Rate limiting: 60 requests per minute
  const ip = getClientIp(req);
  const rl = checkRateLimit(ip, { limit: 60, windowMs: 60_000, keyPrefix: "health" });
  if (!rl.allowed) {
    return rateLimitResponse(rl.resetAt);
  }

  const timestamp = new Date().toISOString();
  let supabaseStatus: "connected" | "unavailable" | "not_configured" = "not_configured";

  if (isSupabaseConfigured) {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from("hackathons")
        .select("id", { count: "exact", head: true });

      if (error) {
        supabaseStatus = "unavailable";
      } else {
        supabaseStatus = "connected";
      }
    } catch {
      supabaseStatus = "unavailable";
    }
  }

  return NextResponse.json({
    status: "ok",
    app: "SideQuest",
    timestamp,
    supabase: supabaseStatus,
  });
}
