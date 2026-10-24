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
      const firstName = message.from?.first_name || "Builder";

      const { sendTelegramMessage } = await import("@/lib/telegram");

      // Handle standard commands securely
      if (text.startsWith("/start")) {
        const parts = text.split(/\s+/);
        const param = parts[1]; // e.g. "event_<id>" or "web_connect"

        if (param && param.startsWith("event_")) {
          const eventId = param.replace("event_", "");
          const { getHackathonById } = await import("@/lib/db/hackathons");
          const { cleanPrizeText } = await import("@/lib/hackathons");
          const event = await getHackathonById(eventId);

          if (event) {
            const prize = cleanPrizeText({
              prize_amount_inr: event.prize_amount_inr ?? 0,
              prize_text: event.prize_text,
            });
            const deadlineMsg = event.reg_deadline
              ? `📅 <b>Registration Deadline:</b> ${new Date(event.reg_deadline).toUTCString()}`
              : "📅 <b>Deadline:</b> Open / not stated";

            await sendTelegramMessage({
              chatId,
              text: `🎯 <b>BuildSeek Deadline Alert Active</b>\n\n` +
                `<b>${event.title}</b>\n` +
                `🏢 <i>${event.organizer}</i>\n` +
                `📍 Mode: ${event.mode} ${event.city ? `(${event.city})` : ""}\n` +
                `🏆 Prize Pool: ${prize}\n` +
                `${deadlineMsg}\n\n` +
                `🔔 You will receive high-priority alerts 24 hours and 3 hours before this deadline closes!`,
              replyMarkup: {
                inline_keyboard: [
                  [
                    {
                      text: "🌐 View on BuildSeek",
                      url: `${process.env.NEXT_PUBLIC_APP_URL || "https://sidequesttt.vercel.app"}/h/${event.id}`,
                    },
                    {
                      text: "🚀 Direct Apply",
                      url: event.apply_url || event.official_page || event.source_url,
                    },
                  ],
                ],
              },
            });
          } else {
            await sendTelegramMessage({
              chatId,
              text: `👋 Hey ${firstName}! Welcome to <b>BuildSeek Alerts</b>.\n\n` +
                `Your deadline radar is active! We'll alert you 24h & 3h before your tracked hackathons close.`,
            });
          }
        } else {
          // Standard /start
          await sendTelegramMessage({
            chatId,
            text: `👋 Hey ${firstName}! Welcome to <b>BuildSeek Alerts</b>.\n\n` +
              `🚀 <b>Never miss a hackathon deadline again.</b>\n\n` +
              `• ⏰ <b>24-Hour Warnings:</b> High-priority alerts before registrations end.\n` +
              `• 🏆 <b>Weekly Digest:</b> The top campus hackathons every Friday.\n` +
              `• 🎯 <b>Event Tracking:</b> Tap the Telegram button on any hackathon card on BuildSeek to track it directly.\n\n` +
              `Explore live hackathons: ${process.env.NEXT_PUBLIC_APP_URL || "https://sidequesttt.vercel.app"}/discover`,
            replyMarkup: {
              inline_keyboard: [
                [
                  {
                    text: "🔍 Browse Hackathons",
                    url: `${process.env.NEXT_PUBLIC_APP_URL || "https://sidequesttt.vercel.app"}/discover`,
                  },
                ],
              ],
            },
          });
        }
      } else if (text.startsWith("/help")) {
        await sendTelegramMessage({
          chatId,
          text: `ℹ️ <b>BuildSeek Bot Help</b>\n\n` +
            `• /start - Activate bot & check radar status\n` +
            `• /mute - Pause upcoming deadline notifications\n\n` +
            `To track a hackathon, browse ${process.env.NEXT_PUBLIC_APP_URL || "https://sidequesttt.vercel.app"}/discover and click the Telegram icon on any card!`,
        });
      } else if (text.startsWith("/mute")) {
        await sendTelegramMessage({
          chatId,
          text: `🔕 <b>Alerts Muted</b>\n\n` +
            `Your notifications have been temporarily paused. Send /start anytime to reactivate your radar!`,
        });
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
