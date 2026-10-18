import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyTelegramWebhookToken } from "@/lib/security/webhook";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/security/rate-limit";

const TelegramUpdateSchema = z
  .object({
    update_id: z.number().int(),
    message: z
      .object({
        message_id: z.number().int(),
        from: z
          .object({
            id: z.number().int(),
            is_bot: z.boolean().optional(),
            first_name: z.string().optional(),
            username: z.string().optional(),
          })
          .optional(),
        chat: z.object({
          id: z.number().int(),
          type: z.string(),
        }),
        date: z.number().int(),
        text: z.string().optional(),
      })
      .optional(),
  })
  .strict();

export async function POST(req: NextRequest) {
  // 1. Rate limiting: 60 webhook requests per minute
  const ip = getClientIp(req);
  const rl = checkRateLimit(ip, { limit: 60, windowMs: 60_000, keyPrefix: "telegram_webhook" });
  if (!rl.allowed) {
    return rateLimitResponse(rl.resetAt);
  }

  // 2. Cryptographic signature / secret token verification
  const secretHeader = req.headers.get("x-telegram-bot-api-secret-token");
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (!expectedSecret || !verifyTelegramWebhookToken(secretHeader, expectedSecret)) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Invalid or missing webhook signature" },
      { status: 401 }
    );
  }

  try {
    const rawBody = await req.json();
    const parsed = TelegramUpdateSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload schema", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { message } = parsed.data;
    if (message?.text) {
      const text = message.text.trim();
      const chatId = message.chat.id;

      // Handle standard commands securely
      if (text.startsWith("/start")) {
        // e.g., /start or /start sync_saved_quests
      } else if (text.startsWith("/mute")) {
        // Handle alert muting
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Internal processing error" },
      { status: 500 }
    );
  }
}
