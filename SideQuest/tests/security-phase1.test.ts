import { describe, it, expect } from "vitest";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { verifyTelegramWebhookToken, timingSafeEqualString } from "@/lib/security/webhook";

describe("Phase 1 Security & Hardening Suite", () => {
  describe("Rate Limiting", () => {
    it("enforces sliding window rate limit threshold", () => {
      const opts = { limit: 3, windowMs: 10_000, keyPrefix: "test_rl" };
      const ip = "192.168.1.100";

      const r1 = checkRateLimit(ip, opts);
      expect(r1.allowed).toBe(true);
      expect(r1.remaining).toBe(2);

      const r2 = checkRateLimit(ip, opts);
      expect(r2.allowed).toBe(true);
      expect(r2.remaining).toBe(1);

      const r3 = checkRateLimit(ip, opts);
      expect(r3.allowed).toBe(true);
      expect(r3.remaining).toBe(0);

      const r4 = checkRateLimit(ip, opts);
      expect(r4.allowed).toBe(false);
      expect(r4.remaining).toBe(0);
    });
  });

  describe("Cryptographic Webhook Verification", () => {
    it("validates exact token using timing-safe comparison", () => {
      const secret = "super-secret-token-123456789";
      expect(timingSafeEqualString(secret, secret)).toBe(true);
      expect(timingSafeEqualString(secret, "wrong-secret-token")).toBe(false);
    });

    it("verifies telegram webhook token properly", () => {
      const secret = "production-telegram-secret-999";
      expect(verifyTelegramWebhookToken(secret, secret)).toBe(true);
      expect(verifyTelegramWebhookToken("tampered-token", secret)).toBe(false);
      expect(verifyTelegramWebhookToken(null, secret)).toBe(false);
      expect(verifyTelegramWebhookToken(undefined, secret)).toBe(false);
    });
  });

  describe("BOLA & Input Validation", () => {
    it("verifies submit schema rejects extra unexpected keys (.strict())", async () => {
      const { POST } = await import("@/app/api/submit/route");
      const maliciousPayload = {
        title: "Test Hackathon",
        organizer: "Test Org",
        apply_url: "https://example.com/apply",
        admin_override: true, // Injected unexpected property
      };

      const req = new Request("http://localhost:3000/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(maliciousPayload),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Validation failed");
      expect(
        json.details?.some(
          (i: any) =>
            i.code === "unrecognized_keys" && i.keys?.includes("admin_override")
        )
      ).toBe(true);
    });

    it("verifies bookmarks POST rejects unauthenticated requests (BOLA protection)", async () => {
      const { POST } = await import("@/app/api/bookmarks/route");
      const req = new Request("http://localhost:3000/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hackathonId: "c1000000-0000-0000-0000-000000000001",
          userId: "victim-user-id", // BOLA injection attempt
        }),
      });

      const res = await POST(req as any);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe("Unauthorized");
    });
  });
});
