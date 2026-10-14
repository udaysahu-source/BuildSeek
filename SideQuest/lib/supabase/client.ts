import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseClient as getBaseClient } from "@/lib/supabase";

let browserClient: any = null;

export function getSupabaseBrowserClient() {
  if (typeof window === "undefined") {
    return getBaseClient();
  }

  if (!browserClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-project.supabase.co";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy-anon-key";
    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }

  return browserClient;
}

export const supabase = getSupabaseBrowserClient();
