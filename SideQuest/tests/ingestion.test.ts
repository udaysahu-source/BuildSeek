import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { CuratedAdapter } from "@/ingestion/adapters/curated";
import { DevpostAdapter } from "@/ingestion/adapters/devpost";
import { UnstopAdapter } from "@/ingestion/adapters/unstop";
import { DevfolioAdapter } from "@/ingestion/adapters/devfolio";
import { Hack2skillAdapter } from "@/ingestion/adapters/hack2skill";
import { detectOrganizerType } from "@/ingestion/adapters/types";
import {
  areDuplicates,
  calculateTrigramSimilarity,
  normalizeTitle,
  mergeHackathons,
} from "@/ingestion/dedupe";
import { runIngestion } from "@/ingestion/run";
import unstopFixture from "@/ingestion/fixtures/unstop.json";
import devfolioFixture from "@/ingestion/fixtures/devfolio.json";
import devpostFixture from "@/ingestion/fixtures/devpost.json";
import curatedFixture from "@/ingestion/fixtures/curated.json";
import hack2skillFixture from "@/ingestion/fixtures/hack2skill.json";

describe("SideQuest Auto-Ingest Pipeline", () => {
  const origEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...origEnv };
  });

  afterEach(() => {
    process.env = { ...origEnv };
  });

  describe("Adapter: Devpost", () => {
    it("is enabled by default", () => {
      const adapter = new DevpostAdapter();
      expect(adapter.isEnabled()).toBe(true);
    });

    it("normalizes date-only deadlines with deadline_precision date and end-of-day UTC", () => {
      const adapter = new DevpostAdapter();
      const item = adapter.normalize(devpostFixture[0]);

      expect(item).not.toBeNull();
      expect(item?.title).toBe("Build, Ship, Shape: Amazon Developer Hackathon");
      expect(item?.source).toBe("devpost");
      expect(item?.deadline_precision).toBe("date");
      expect(item?.reg_deadline).toContain("T23:59:59.000Z");
      expect(item?.fee_type).toBe("unknown");
      expect(item?.prize_currency).toBe("USD");
      expect(item?.prize_amount).toBe(138000);
      expect(item?.prize_amount_inr).toBe(138000 * 85);
      expect(item?.organizer_type).toBe("company");
    });

    it("drops broken Devpost rows missing title or url", () => {
      const adapter = new DevpostAdapter();
      const item = adapter.normalize(devpostFixture[2]);
      expect(item).toBeNull();
    });
  });

  describe("Adapter: Unstop", () => {
    it("can be disabled with ENABLE_UNSTOP=0", () => {
      const adapter = new UnstopAdapter();
      expect(adapter.isEnabled()).toBe(true);

      process.env.ENABLE_UNSTOP = "0";
      expect(adapter.isEnabled()).toBe(false);
    });

    it("marks scope_assumed: true and detects organizer keywords", () => {
      const adapter = new UnstopAdapter();
      const item1 = adapter.normalize(unstopFixture[0]);

      expect(item1).not.toBeNull();
      expect(item1?.scope_assumed).toBe(true);
      expect(item1?.scope).toBe("national");
      expect(item1?.organizer_type).toBe("government");

      const item2 = adapter.normalize(unstopFixture[1]);
      expect(item2).not.toBeNull();
      expect(item2?.organizer_type).toBe("college");
    });
  });

  describe("Adapter: Curated", () => {
    it("normalizes curated entries with verified_primary confidence", () => {
      const adapter = new CuratedAdapter();
      const item = adapter.normalize(curatedFixture.hackathons[0]);

      expect(item).not.toBeNull();
      expect(item?.title).toBe("Smart India Hackathon 2026");
      expect(item?.data_confidence).toBe("verified_primary");
      expect(item?.fee_type).toBe("free");
      expect(item?.organizer_type).toBe("government");
    });

    it("requires title and source_url for curated entries", () => {
      const adapter = new CuratedAdapter();
      expect(adapter.normalize({ title: "", source_url: "https://test.com" })).toBeNull();
      expect(adapter.normalize({ title: "Test", source_url: "" })).toBeNull();
    });
  });

  describe("Adapter: Devfolio (Experimental)", () => {
    it("is disabled by default and enabled with ENABLE_DEVFOLIO=1", () => {
      delete process.env.ENABLE_DEVFOLIO;
      const adapter = new DevfolioAdapter();
      expect(adapter.isEnabled()).toBe(false);

      process.env.ENABLE_DEVFOLIO = "1";
      expect(adapter.isEnabled()).toBe(true);
    });

    it("marks rows with needs_review: true as per spec", () => {
      const adapter = new DevfolioAdapter();
      const item = adapter.normalize(devfolioFixture[0]);
      expect(item).not.toBeNull();
      expect(item?.needs_review).toBe(true);
    });
  });

  describe("Adapter: Hack2skill (Discovery)", () => {
    it("is disabled by default and enabled with ENABLE_HACK2SKILL=1", () => {
      delete process.env.ENABLE_HACK2SKILL;
      const adapter = new Hack2skillAdapter();
      expect(adapter.isEnabled()).toBe(false);

      process.env.ENABLE_HACK2SKILL = "1";
      expect(adapter.isEnabled()).toBe(true);
    });

    it("creates discovery row with null deadline and needs_review: true", () => {
      const adapter = new Hack2skillAdapter();
      const item = adapter.normalize(hack2skillFixture[0]);
      expect(item).not.toBeNull();
      expect(item?.reg_deadline).toBeNull();
      expect(item?.needs_review).toBe(true);
    });
  });

  describe("Organizer Type Detection", () => {
    it("classifies ministries and departments as government", () => {
      expect(detectOrganizerType("Ministry of Electronics and IT")).toBe("government");
      expect(detectOrganizerType("AICTE Innovation Cell")).toBe("government");
    });

    it("classifies government colleges as college, not government", () => {
      expect(detectOrganizerType("IIT Bombay Student Chapter")).toBe("college");
      expect(detectOrganizerType("NIT Trichy Fest")).toBe("college");
    });

    it("classifies companies and startups as company", () => {
      expect(detectOrganizerType("Amazon Web Services")).toBe("company");
      expect(detectOrganizerType("Acme Technologies Pvt Ltd")).toBe("company");
    });
  });

  describe("Deduplication and Merging", () => {
    it("merges cross-source duplicates by URL or title similarity", () => {
      const adapterDevpost = new DevpostAdapter();
      const itemA = adapterDevpost.normalize(devpostFixture[0])!;
      const itemB = {
        ...itemA,
        source: "aggregator",
        source_id: "agg-123",
        venue: "Virtual AWS Discord",
      };

      expect(areDuplicates(itemA, itemB)).toBe(true);

      const merged = mergeHackathons(itemA, itemB);
      expect(merged.venue).toBe("Virtual AWS Discord");
      expect(merged.source).toBe("devpost");
    });
  });

  describe("Ingestion Runner", () => {
    it("runs dry-run ingestion without writing files and logs scrape_runs", async () => {
      const result = await runIngestion({ useFixture: true, dryRun: true });

      expect(result.scrapeRuns.length).toBeGreaterThanOrEqual(2);
      expect(result.totalFetched).toBeGreaterThan(0);
      expect(result.hackathons.length).toBeGreaterThan(0);
    });
  });
});
