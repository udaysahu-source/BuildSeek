import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/quest-log";

  // Check if provider returned an OAuth error or user cancelled
  const errorDesc = searchParams.get("error_description");
  const errorCode = searchParams.get("error");
  if (errorDesc || errorCode) {
    const message = errorDesc || errorCode || "oauth_failed";
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(message)}`);
  }

  // Sanitize redirect target to avoid open redirects
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/quest-log";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${safeNext}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${safeNext}`);
      } else {
        return NextResponse.redirect(`${origin}${safeNext}`);
      }
    } else {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
    }
  }

  // Return user to login with error query param
  return NextResponse.redirect(`${origin}/login?error=oauth_exchange_failed`);
}
