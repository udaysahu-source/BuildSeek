import { describe, it, expect } from "vitest";
import { scrubHackathon, scrubProfile, redactPII } from "@/lib/security/privacy";

describe("Phase 2 Privacy & Data Lifecycle Suite", () => {
  describe("Payload Scrubbing", () => {
    it("scrubs internal fields and submitter PII from hackathon records", () => {
      const rawHackathon = {
        id: "c1000000-0000-0000-0000-000000000001",
        title: "Test AI Hackathon",
        organizer: "Test Org",
        submitted_by: "550e8400-e29b-41d4-a716-446655440000",
        contact_email: "organizer@example.com",
        contact_telegram: "@organizer",
        needs_review: true,
        canonical_id: "canonical-123",
        last_seen_at: "2026-10-18T00:00:00Z",
        fts: "internal tsvector",
        tags: ["ai", "agents"],
      };

      const scrubbed = scrubHackathon(rawHackathon);

      expect(scrubbed.title).toBe("Test AI Hackathon");
      expect(scrubbed.tags).toEqual(["ai", "agents"]);
      expect((scrubbed as any).submitted_by).toBeUndefined();
      expect((scrubbed as any).contact_email).toBeUndefined();
      expect((scrubbed as any).contact_telegram).toBeUndefined();
      expect((scrubbed as any).needs_review).toBeUndefined();
      expect((scrubbed as any).canonical_id).toBeUndefined();
      expect((scrubbed as any).last_seen_at).toBeUndefined();
      expect((scrubbed as any).fts).toBeUndefined();
    });

    it("scrubs sensitive tokens from profile records", () => {
      const rawProfile = {
        id: "user-123",
        skills: ["React", "Rust"],
        year: 3,
        calendar_token: "secret-calendar-token-uuid",
      };

      const scrubbed = scrubProfile(rawProfile);
      expect(scrubbed?.id).toBe("user-123");
      expect(scrubbed?.skills).toEqual(["React", "Rust"]);
      expect((scrubbed as any)?.calendar_token).toBeUndefined();
    });
  });

  describe("Log Sanitization & PII Redaction", () => {
    it("redacts email addresses, phones, and bearer tokens", () => {
      const logWithPII = "User john.doe@university.edu signed in with token bearer eyJhbGciOiJIUzI1Ni... Call +91 9876543210";
      const sanitized = redactPII(logWithPII);

      expect(sanitized).toContain("[REDACTED_EMAIL]");
      expect(sanitized).not.toContain("john.doe@university.edu");
      expect(sanitized).toContain("[REDACTED_TOKEN]");
      expect(sanitized).not.toContain("eyJhbGciOiJIUzI1Ni");
    });

    it("redacts sensitive keys in objects recursively", () => {
      const sensitiveObject = {
        user: {
          email: "student@college.edu",
          passwordHash: "super-secret-hash",
          apiKey: "sk_live_123456",
        },
      };

      const sanitized = redactPII(sensitiveObject);
      expect(sanitized.user.email).toBe("[REDACTED_EMAIL]");
      expect(sanitized.user.passwordHash).toBe("[REDACTED_SECRET]");
      expect(sanitized.user.apiKey).toBe("[REDACTED_SECRET]");
    });
  });

  describe("Account Deletion Flow", () => {
    it("rejects unauthorized account deletion attempts with 401", async () => {
      const { DELETE } = await import("@/app/api/user/account/route");
      const req = new Request("http://localhost:3000/api/user/account", {
        method: "DELETE",
      });

      const res = await DELETE(req as any);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe("Unauthorized");
    });
  });
});
