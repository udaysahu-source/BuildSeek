import { logger } from "@/lib/security/logger";

export interface TelegramSendMessageOptions {
  chatId: number | string;
  text: string;
  parseMode?: "HTML" | "Markdown" | "MarkdownV2";
  replyMarkup?: any;
}

/**
 * Sends a message via Telegram Bot API using the configured TELEGRAM_BOT_TOKEN
 */
export async function sendTelegramMessage({
  chatId,
  text,
  parseMode = "HTML",
  replyMarkup,
}: TelegramSendMessageOptions): Promise<{ ok: boolean; result?: any; error?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    logger.warn("Telegram bot token not configured (TELEGRAM_BOT_TOKEN missing)", undefined, undefined, "telegram");
    return { ok: false, error: "TELEGRAM_BOT_TOKEN not configured" };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode,
        ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      logger.warn("Failed to send Telegram message", undefined, data, "telegram");
      return { ok: false, error: data.description || "Telegram API error" };
    }

    return { ok: true, result: data.result };
  } catch (err) {
    logger.error("Exception sending Telegram message", err, undefined, "telegram");
    return { ok: false, error: String(err) };
  }
}
