import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/security/rate-limit";
import { getAuthenticatedUser } from "@/lib/supabase/server";

const SubmitSchema = z
  .object({
    title: z.string().trim().min(3, "Title must be at least 3 characters").max(200),
    organizer: z.string().trim().min(2, "Organizer name is required").max(150),
    organizer_type: z
      .enum(["government", "company", "college", "community", "nonprofit", "other"])
      .default("college"),
    mode: z.enum(["online", "offline", "hybrid"]).default("online"),
    city: z.string().trim().max(100).optional().nullable(),
    scope: z
      .enum(["global", "national", "state", "city", "college", "nearby"])
      .default("national"),
    prize_text: z.string().trim().max(300).optional().nullable(),
    prize_amount_inr: z.number().int().nonnegative().optional().default(0),
    fee_type: z.enum(["free", "paid", "unknown"]).default("free"),
    fee_amount_inr: z.number().int().nonnegative().optional().default(0),
    apply_url: z.string().trim().url("Must be a valid URL"),
    reg_deadline: z.string().datetime({ offset: true }).optional().nullable(),
    start_date: z.string().datetime({ offset: true }).optional().nullable(),
    end_date: z.string().datetime({ offset: true }).optional().nullable(),
    tags: z.array(z.string().trim().max(50)).max(20).default([]),
    eligibility: z.string().trim().max(500).optional().nullable(),
    contact_email: z.string().trim().email("Valid email required").optional().nullable(),
    contact_telegram: z.string().trim().max(100).optional().nullable(),
  })
  .strict();

export async function POST(req: Request) {
  // 1. Strict rate limiting: 5 submissions per 10 minutes per IP
  const ip = getClientIp(req);
  const rl = checkRateLimit(ip, {
    limit: 5,
    windowMs: 10 * 60 * 1000,
    keyPrefix: "submit_form",
  });

  if (!rl.allowed) {
    return rateLimitResponse(rl.resetAt);
  }

  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    // 2. Strict Zod Schema Validation
    const parsed = SubmitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Optional authenticated user
    const user = await getAuthenticatedUser(req);

    // 3. Database Persistence
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isSupabaseConfigured =
      supabaseUrl && !supabaseUrl.includes("your-project.supabase.co");

    if (isSupabaseConfigured) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const serviceKey =
          process.env.SUPABASE_SERVICE_ROLE_KEY ||
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, serviceKey);

        await supabase.from("submissions").insert({
          payload: data,
          status: "pending",
          submitted_by: user?.id || null,
          created_at: new Date().toISOString(),
        });
      } catch (err) {
        // Redacted structured logging - no sensitive payload or auth credentials leaked
        console.error("Submissions insert error occurred:", err instanceof Error ? err.name : "DB_ERROR");
      }
    }

    return NextResponse.json({
      success: true,
      message:
        "Hackathon submitted successfully! Our community team will verify and list it within 24 hours.",
      id: `sub_${Date.now()}`,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to process submission" },
      { status: 500 }
    );
  }
}
