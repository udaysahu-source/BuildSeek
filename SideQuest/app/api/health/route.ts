import { NextResponse } from "next/server";
import { isSupabaseConfigured, getSupabaseClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const timestamp = new Date().toISOString();
  let supabaseStatus = "not_configured";
  let count = null;

  if (isSupabaseConfigured) {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("hackathons")
        .select("id", { count: "exact", head: true });

      if (error) {
        supabaseStatus = `error: ${error.message}`;
      } else {
        supabaseStatus = "connected";
        count = data;
      }
    } catch (err: any) {
      supabaseStatus = `exception: ${err.message}`;
    }
  }

  return NextResponse.json({
    status: "ok",
    app: "SideQuest",
    timestamp,
    supabase: supabaseStatus,
    active_records_checked: count,
  });
}
