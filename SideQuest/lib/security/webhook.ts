import crypto from "crypto";

/**
 * Timing-safe string comparison to prevent timing attacks
 */
export function timingSafeEqualString(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") {
    return false;
  }
  const bufA = Buffer.from(a, "utf-8");
  const bufB = Buffer.from(b, "utf-8");

  if (bufA.length !== bufB.length) {
    // Constant time dummy check to avoid length leak
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }

  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Verifies Telegram Bot API webhook secret token header
 * Telegram sends header: X-Telegram-Bot-Api-Secret-Token
 */
export function verifyTelegramWebhookToken(
  headerToken: string | null | undefined,
  expectedSecret: string | undefined
): boolean {
  if (!headerToken || !expectedSecret) {
    return false;
  }
  return timingSafeEqualString(headerToken, expectedSecret);
}

/**
 * Verifies generic HMAC-SHA256 signature for raw request bodies (e.g. Stripe, Razorpay, GitHub)
 */
export function verifyHmacSha256(
  rawBody: string | Buffer,
  signature: string,
  secret: string
): boolean {
  if (!rawBody || !signature || !secret) {
    return false;
  }
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(rawBody);
  const expectedSignature = hmac.digest("hex");

  return timingSafeEqualString(signature, expectedSignature);
}
