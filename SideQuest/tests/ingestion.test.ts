import { describe, it, expect } from "vitest";
import { UnstopAdapter } from "@/ingestion/adapters/unstop";
import { DevfolioAdapter } from "./../ingestion/adapters/devfolio";
import { areDuplicates, calculateTrigramSimilarity, normalizeTitle } from "@/ingestion/dedupe";
import { runIngestion } from "@/ingestion/run";
import unstopFixture from "@/ingestion/fixtures/unstop.json";
import devfolioFixture from "@/ingestion/fixtures/devfolio.json";

describe("Phase 5: Ingestion Pipeline", () => {
  describe("Normalization", () => {
    it("normalizes valid Unstop listings and drops invalid rows", () => {
      const adapter = new UnstopAdapter();

      // Item 1: Valid
      const item1 = adapter.normalize(unstopFixture[0]);
      expect(item1).not.toBeNull();
      expect(item1?.title).toBe("National AI Srijan Hackathon 2026");
      expect(item1?.source).toBe("unstop");
      expect(item1?.prize_amount_inr).toBe(1000000);
      expect(item1?.mode).toBe("online");

      // Item 3: Broken row (empty title)
      const item3 = adapter.normalize(unstopFixture[2]);
      expect(item3).toBeNull();
    });

    it("normalizes valid Devfolio listings with correct schema", () => {
      const adapter = new DevfolioAdapter();
      const item = adapter.normalize(devfolioFixture[0]);

      expect(item).not.toBeNull();
      expect(item?.title).toBe("Bengaluru ETH Buildathon 2026");
      expect(item?.source).toBe("devfolio");
      expect(item?.city).toBe("Bengaluru");
      expect(item?.mode).toBe("offline");
      expect(item?.tags).toContain("ethereum");
    });
  });

  describe("Deduplication Engine", () => {
    it("normalizes titles by stripping noise words, years, and editions", () => {
      const title1 = "Delhi Open FinTech Sprint";
      const title2 = "Delhi Open Fintech Sprint 2026 Edition";

      const norm1 = normalizeTitle(title1);
      const norm2 = normalizeTitle(title2);

      expect(norm1).toBe("delhi open fintech");
      expect(norm2).toBe("delhi open fintech");
    });

    it("calculates trigram similarity above 0.8 for cross-platform duplicates", () => {
      const titleA = "Bengaluru AI Agents Buildathon 2026";
      const titleB = "Bengaluru AI Agents Buildathon (Annual Edition)";

      const similarity = calculateTrigramSimilarity(titleA, titleB);
      expect(similarity).toBeGreaterThanOrEqual(0.8);
    });

    it("flags duplicate hackathons when normalized title matches and start dates are within 2 days", () => {
      const adapterUnstop = new UnstopAdapter();
      const adapterDevfolio = new DevfolioAdapter();

      const itemFromUnstop = adapterUnstop.normalize(unstopFixture[1])!;
      const itemFromDevfolio = adapterDevfolio.normalize(devfolioFixture[1])!;

      const isDup = areDuplicates(itemFromUnstop, itemFromDevfolio);
      expect(isDup).toBe(true);
    });
  });

  describe("Ingestion Runner", () => {
    it("runs ingestion successfully against fixtures and records scrape_runs", async () => {
      const result = await runIngestion(true); // use fixtures

      expect(result.scrapeRuns.length).toBe(2);
      expect(result.scrapeRuns.map((r) => r.source)).toEqual(["unstop", "devfolio"]);
      expect(result.totalFetched).toBeGreaterThan(0);
      expect(result.scrapeRuns.every((r) => r.error === null)).toBe(true);
    });
  });
});
