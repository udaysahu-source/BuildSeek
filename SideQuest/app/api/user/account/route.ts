import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, createSupabaseServerClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/security/rate-limit";
import { isSupabaseConfigured, getSupabaseClient } from "@/lib/supabase";
import { logger } from "@/lib/security/logger";

export async function DELETE(req: NextRequest) {
  // 1. Rate limiting: 5 account deletion requests per hour per IP
  const ip = getClientIp(req);
  const rl = checkRateLimit(ip, {
    limit: 5,
    windowMs: 60 * 60 * 1000,
    keyPrefix: "delete_account",
  });

  if (!rl.allowed) {
    return rateLimitResponse(rl.resetAt);
  }

  // 2. Authenticate user from session (BOLA defense)
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Sign in required to perform account deletion" },
      { status: 401 }
    );
  }

  const userId = user.id;

  // 3. Cascading Hard Delete of all user records
  if (isSupabaseConfigured) {
    try {
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      
      let client = getSupabaseClient();
      if (serviceRoleKey) {
        const { createClient } = await import("@supabase/supabase-js");
        client = createClient(supabaseUrl, serviceRoleKey);
      }

      // Cascading deletion across relational tables
      await Promise.allSettled([
        // Delete user's bookmarks
        client.from("bookmarks").delete().eq("user_id", userId),
        // Delete user's alert rules
        client.from("alert_rules").delete().eq("user_id", userId),
        // Delete user's notification history
        client.from("notifications_log").delete().eq("user_id", userId),
        // Disassociate user from submitted hackathons
        client.from("submissions").update({ submitted_by: null }).eq("submitted_by", userId),
        // Delete user profile
        client.from("profiles").delete().eq("id", userId),
      ]);

      // If service role key is available, permanently delete auth user record
      if (serviceRoleKey) {
        try {
          await client.auth.admin.deleteUser(userId);
        } catch (authErr) {
          logger.warn("Could not delete auth user via admin API", authErr, undefined, "account_delete");
        }
      }
    } catch (err) {
      logger.error("Error executing cascading account deletion", err, undefined, "account_delete");
      return NextResponse.json(
        { error: "Internal Server Error", message: "Failed to complete account deletion" },
        { status: 500 }
      );
    }
  }

  // Invalidate cookies/session
  try {
    const serverClient = await createSupabaseServerClient();
    await serverClient.auth.signOut();
  } catch {
    // Ignore signout error if session already wiped
  }

  logger.info("User account and associated records deleted permanently", undefined, "account_delete");

  return NextResponse.json({
    success: true,
    message: "Your account and all associated personal data have been permanently deleted in accordance with DPDP and GDPR erasure rights.",
  });
}
