import { describe, it, expect } from "vitest";
import { getHackathons, getHackathonById } from "@/lib/db/hackathons";

describe("Hackathon Query Engine (Phase 2)", () => {
  it("hides closed hackathons by default (FR-6)", async () => {
    const defaultList = await getHackathons();
    const hasClosed = defaultList.hackathons.some((h) => h.status === "closed");
    expect(hasClosed).toBe(false);

    const withClosed = await getHackathons({ include_closed: true });
    const containsClosed = withClosed.hackathons.some((h) => h.status === "closed");
    expect(containsClosed).toBe(true);
  });

  it("filters accurately by mode", async () => {
    const onlineOnly = await getHackathons({ mode: "online" });
    expect(onlineOnly.hackathons.length).toBeGreaterThan(0);
    expect(onlineOnly.hackathons.every((h) => h.mode === "online")).toBe(true);
  });

  it("filters accurately by city (case-insensitive substring)", async () => {
    const blr = await getHackathons({ city: "bengaluru" });
    expect(blr.hackathons.length).toBeGreaterThan(0);
    expect(blr.hackathons.every((h) => h.city?.toLowerCase().includes("bengaluru"))).toBe(true);
  });

  it("filters by status closing_soon (< 72 hours)", async () => {
    const closingSoon = await getHackathons({ status: "closing_soon" });
    expect(closingSoon.hackathons.length).toBeGreaterThan(0);
    expect(closingSoon.hackathons.every((h) => h.status === "closing_soon")).toBe(true);
  });

  it("searches keywords across title, organizer, and tags", async () => {
    const aiSearch = await getHackathons({ q: "agents", include_closed: true });
    expect(aiSearch.hackathons.length).toBeGreaterThan(0);
    expect(
      aiSearch.hackathons.every(
        (h) =>
          h.title.toLowerCase().includes("agents") ||
          h.organizer.toLowerCase().includes("agents") ||
          h.tags.some((t) => t.toLowerCase().includes("agents"))
      )
    ).toBe(true);
  });

  it("sorts by prize descending", async () => {
    const sorted = await getHackathons({ sort: "prize_high" });
    for (let i = 0; i < sorted.hackathons.length - 1; i++) {
      const current = sorted.hackathons[i].prize_amount_inr || 0;
      const next = sorted.hackathons[i + 1].prize_amount_inr || 0;
      expect(current).toBeGreaterThanOrEqual(next);
    }
  });

  it("retrieves a single hackathon by ID", async () => {
    const item = await getHackathonById("c1000000-0000-0000-0000-000000000001");
    expect(item).not.toBeNull();
    expect(item?.title).toContain("OpenCV AI Competition 2026");
    expect(item?.status).toBeDefined();
  });
});
