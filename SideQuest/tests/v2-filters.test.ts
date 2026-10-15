import { describe, it, expect } from "vitest";
import {
  filterHackathons,
  haversineDistanceKm,
  formatFee,
  normalizeHackathon,
  HackathonUI,
} from "@/lib/hackathons";
import { REAL_HACKATHONS } from "@/seed/hackathons";
import { getHackathons } from "@/lib/db/hackathons";
import fs from "fs";
import path from "path";

describe("v2 Real Data and Filter Spec", () => {
  const now = new Date("2026-10-15T12:00:00Z").getTime();
  const normalizedReal = REAL_HACKATHONS.map((h) => normalizeHackathon(h as any));

  it("loads 7 verified entries from real data seed without inventing data", () => {
    const seedPath = path.join(process.cwd(), "docs/real-data-seed.json");
    const rawSeed = JSON.parse(fs.readFileSync(seedPath, "utf-8"));

    expect(rawSeed.hackathons).toHaveLength(7);
    expect(REAL_HACKATHONS).toHaveLength(7);

    // Verify SIH 2026
    const sih = REAL_HACKATHONS.find((h) => h.source_id === "sih-2026");
    expect(sih).toBeDefined();
    expect(sih?.organizer_type).toBe("government");
    expect(sih?.scope).toBe("national");
    expect(sih?.mode).toBe("hybrid");
    expect(sih?.data_confidence).toBe("unverified");
    expect(sih?.fee_type).toBe("unknown"); // Never guessed as free
    expect(sih?.reg_deadline).toBeNull(); // Not stated, preserved as null

    // Verify OpenCV 2026
    const opencv = REAL_HACKATHONS.find((h) => h.source_id === "opencv26");
    expect(opencv).toBeDefined();
    expect(opencv?.organizer_type).toBe("company");
    expect(opencv?.scope).toBe("global");
    expect(opencv?.data_confidence).toBe("verified_primary");
    expect(opencv?.deadline_note).toContain("Pacific Time");
  });

  describe("Price Filtering (FR v2)", () => {
    it("filters only fee_type = 'free' when price is 'free'", () => {
      const mockEvents: HackathonUI[] = [
        {
          ...normalizedReal[0],
          id: "free-1",
          fee_type: "free",
        },
        {
          ...normalizedReal[1],
          id: "paid-1",
          fee_type: "paid",
          fee_amount_inr: 500,
        },
        {
          ...normalizedReal[2],
          id: "unknown-1",
          fee_type: "unknown",
        },
      ];

      const freeResults = filterHackathons(mockEvents, { price: "free" }, now);
      expect(freeResults).toHaveLength(1);
      expect(freeResults[0].id).toBe("free-1");

      const paidResults = filterHackathons(mockEvents, { price: "paid" }, now);
      expect(paidResults).toHaveLength(1);
      expect(paidResults[0].id).toBe("paid-1");

      const allResults = filterHackathons(mockEvents, { price: "all" }, now);
      expect(allResults).toHaveLength(3);
    });

    it("formats fee correctly", () => {
      expect(formatFee({ fee_type: "free" })).toBe("Free");
      expect(formatFee({ fee_type: "paid", fee_amount_inr: 250 })).toBe("₹250");
      expect(formatFee({ fee_type: "unknown" })).toBe("Fee not stated");
    });
  });

  describe("Scope Filtering (FR v2)", () => {
    it("filters scope global and national accurately", () => {
      const globalResults = filterHackathons(normalizedReal, { scope: "global" }, now);
      expect(globalResults.every((h) => h.scope === "global")).toBe(true);

      const nationalResults = filterHackathons(normalizedReal, { scope: "national" }, now);
      expect(
        nationalResults.some((h) => h.scope === "national")
      ).toBe(true);
    });

    it("nearby filter excludes online events and matches offline within radius", () => {
      // Nebius Berlin is offline at (52.4828, 13.4329)
      const berlinLat = 52.52;
      const berlinLng = 13.405;

      const nearbyResults = filterHackathons(
        normalizedReal,
        {
          scope: "nearby",
          user_lat: berlinLat,
          user_lng: berlinLng,
          radius_km: 25,
        },
        now
      );

      // Only offline/hybrid nearby should match
      expect(nearbyResults.every((h) => h.mode !== "online")).toBe(true);
      const nebius = nearbyResults.find((h) => h.source_id === "nebius-nvidia-berlin-2026-10-18");
      expect(nebius).toBeDefined();

      // If user is in Bengaluru (12.9716, 77.5946), Berlin should NOT be nearby with 25km radius
      const blrNearby = filterHackathons(
        normalizedReal,
        {
          scope: "nearby",
          user_lat: 12.9716,
          user_lng: 77.5946,
          radius_km: 100,
        },
        now
      );
      expect(blrNearby.find((h) => h.source_id === "nebius-nvidia-berlin-2026-10-18")).toBeUndefined();
    });

    it("calculates haversine distance correctly", () => {
      // Distance between Bengaluru (12.9716, 77.5946) and Chennai (13.0827, 80.2707) is ~290 km
      const distance = haversineDistanceKm(12.9716, 77.5946, 13.0827, 80.2707);
      expect(distance).toBeGreaterThan(280);
      expect(distance).toBeLessThan(310);
    });
  });

  describe("Organizer Type Filtering (FR v2)", () => {
    it("multi-select filters by organizer type", () => {
      const govOnly = filterHackathons(
        normalizedReal,
        { organizer_types: ["government"] },
        now
      );
      expect(govOnly.length).toBeGreaterThan(0);
      expect(govOnly.every((h) => h.organizer_type === "government")).toBe(true);

      const companyOnly = filterHackathons(
        normalizedReal,
        { organizer_types: ["company"] },
        now
      );
      expect(companyOnly.length).toBeGreaterThan(0);
      expect(companyOnly.every((h) => h.organizer_type === "company")).toBe(true);
    });
  });

  describe("Unverified Exclusion in Best Match Ranking", () => {
    it("excludes unverified rows from default 'Best match' ranking", () => {
      const matchSorted = filterHackathons(normalizedReal, { sort: "match" }, now);
      const hasUnverified = matchSorted.some((h) => h.data_confidence === "unverified");
      expect(hasUnverified).toBe(false);

      // In regular closing sort, unverified entries still appear
      const closingSorted = filterHackathons(normalizedReal, { sort: "closing" }, now);
      const hasUnverifiedInClosing = closingSorted.some(
        (h) => h.data_confidence === "unverified"
      );
      expect(hasUnverifiedInClosing).toBe(true);
    });
  });

  describe("Database Query Engine Integration", () => {
    it("filters by fee_type and scope in getHackathons", async () => {
      const freeList = await getHackathons({ fee_type: "free", include_closed: true });
      expect(freeList.hackathons.every((h) => h.fee_type === "free")).toBe(true);

      const govList = await getHackathons({
        organizer_types: ["government"],
        include_closed: true,
      });
      expect(govList.hackathons.length).toBeGreaterThan(0);
      expect(govList.hackathons.every((h) => h.organizer_type === "government")).toBe(true);
    });
  });
});
