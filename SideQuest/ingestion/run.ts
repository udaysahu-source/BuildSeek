import fs from "fs";
import path from "path";
import { CuratedAdapter } from "./adapters/curated";
import { DevpostAdapter } from "./adapters/devpost";
import { UnstopAdapter } from "./adapters/unstop";
import { DevfolioAdapter } from "./adapters/devfolio";
import { Hack2skillAdapter } from "./adapters/hack2skill";
import { SourceAdapter } from "./adapters/types";
import { deduplicateListings, mergeHackathons } from "./dedupe";
import { Hackathon, ScrapeRun } from "@/lib/types";
import { REAL_HACKATHONS } from "@/seed/hackathons";

export interface IngestRunResult {
  scrapeRuns: ScrapeRun[];
  totalFetched: number;
  totalInserted: number;
  totalUpdated: number;
  totalDuplicatesMerged: number;
  hackathons: Hackathon[];
}

export interface IngestOptions {
  useFixture?: boolean;
  dryRun?: boolean;
}

export async function runIngestion(options: IngestOptions = {}): Promise<IngestRunResult> {
  const { useFixture = false, dryRun = false } = options;

  const allAdapters: SourceAdapter[] = [
    new CuratedAdapter(),
    new DevpostAdapter(),
    new UnstopAdapter(),
    new DevfolioAdapter(),
    new Hack2skillAdapter(),
  ];

  const activeAdapters = allAdapters.filter((a) => a.isEnabled());
  const scrapeRuns: ScrapeRun[] = [];

  let totalFetched = 0;
  let totalInserted = 0;
  let totalUpdated = 0;
  let totalDuplicatesMerged = 0;

  // Load existing hackathons: prefer data/hackathons.json, else seed
  const dataFilePath = path.join(process.cwd(), "data/hackathons.json");
  const existingHackathons: Hackathon[] = [];

  if (fs.existsSync(dataFilePath)) {
    try {
      const fileContent = fs.readFileSync(dataFilePath, "utf-8");
      const parsed = JSON.parse(fileContent);
      const list = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.hackathons)
        ? parsed.hackathons
        : [];
      if (list.length > 0) {
        existingHackathons.push(...list);
      }
    } catch (e) {
      console.warn("Could not parse existing data/hackathons.json:", e);
    }
  }

  if (existingHackathons.length === 0) {
    existingHackathons.push(...REAL_HACKATHONS);
  }

  // Check Supabase mirror if configured
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  let supabaseClient: any = null;

  if (supabaseUrl && supabaseKey && !supabaseUrl.includes("your-project")) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      supabaseClient = createClient(supabaseUrl, supabaseKey);
    } catch (err) {
      console.warn("Supabase client init error in ingestion:", err);
    }
  }

  const healthySources = new Set<string>();

  for (const adapter of activeAdapters) {
    const startedAt = new Date().toISOString();
    let fetched = 0;
    let inserted = 0;
    let updated = 0;
    let runError: string | null = null;
    let rawListings: any[] = [];

    let attempts = 0;
    const maxAttempts = 2; // 1 initial + 1 retry

    while (attempts < maxAttempts) {
      attempts++;
      try {
        rawListings = await adapter.fetchListings(useFixture);
        healthySources.add(adapter.name);
        break;
      } catch (err: any) {
        if (attempts >= maxAttempts) {
          runError = err.message || "Adapter failed after retry";
        }
      }
    }

    fetched = rawListings.length;
    totalFetched += fetched;

    // Normalize and filter out invalid rows
    const normalizedItems: Hackathon[] = [];
    for (const raw of rawListings) {
      const item = adapter.normalize(raw);
      if (item) {
        normalizedItems.push(item);
      }
    }

    // Deduplicate against existing dataset
    const { uniqueNew, mergedDuplicates } = deduplicateListings(
      normalizedItems,
      existingHackathons
    );
    totalDuplicatesMerged += mergedDuplicates.length;

    // Perform upsert into memory dataset
    for (const item of uniqueNew) {
      const existingIdx = existingHackathons.findIndex(
        (e) => e.source === item.source && e.source_id === item.source_id
      );

      if (existingIdx >= 0) {
        existingHackathons[existingIdx] = mergeHackathons(
          existingHackathons[existingIdx],
          item
        );
        updated++;
      } else {
        existingHackathons.push(item);
        inserted++;
      }
    }

    totalInserted += inserted;
    totalUpdated += updated;

    const finishedAt = new Date().toISOString();
    const runLog: ScrapeRun = {
      id: `run-${adapter.name}-${Date.now()}`.padEnd(36, "0").slice(0, 36),
      source: adapter.name,
      started_at: startedAt,
      finished_at: finishedAt,
      fetched,
      inserted,
      updated,
      error: runError,
    };

    scrapeRuns.push(runLog);

    if (supabaseClient && !dryRun) {
      try {
        await supabaseClient.from("scrape_runs").insert(runLog);
      } catch (e) {}
    }
  }

  // Aging out rule: "Rows a healthy source stops listing for 14 days get hidden: true."
  // "A source that fails never breaks the others, and its rows are never aged out."
  const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
  for (const h of existingHackathons) {
    if (healthySources.has(h.source)) {
      const lastSeen = h.last_seen_at ? new Date(h.last_seen_at).getTime() : 0;
      if (lastSeen < fourteenDaysAgo) {
        h.hidden = true;
      }
    }
  }

  // Write to data/hackathons.json if not dryRun
  if (!dryRun) {
    try {
      const dataDir = path.dirname(dataFilePath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      const outputData = {
        updated_at: new Date().toISOString(),
        total: existingHackathons.length,
        hackathons: existingHackathons,
      };

      fs.writeFileSync(dataFilePath, JSON.stringify(outputData, null, 2), "utf-8");
      console.log(`\n💾 Saved ${existingHackathons.length} hackathons to data/hackathons.json`);
    } catch (err) {
      console.error("Failed to write data/hackathons.json:", err);
    }

    // Optional Supabase upsert mirror
    if (supabaseClient) {
      try {
        console.log("Syncing hackathons to Supabase mirror...");
        for (const h of existingHackathons) {
          await supabaseClient.from("hackathons").upsert(h, {
            onConflict: "source,source_id",
          });
        }
        console.log("✅ Supabase mirror sync completed.");
      } catch (err) {
        console.warn("Supabase mirror upsert failed:", err);
      }
    }
  } else {
    console.log("\n[DRY RUN] No writes performed to disk or Supabase.");
  }

  return {
    scrapeRuns,
    totalFetched,
    totalInserted,
    totalUpdated,
    totalDuplicatesMerged,
    hackathons: existingHackathons,
  };
}

// Direct CLI execution
if (require.main === module || process.argv[1]?.includes("run.ts")) {
  console.log("🚀 Starting BuildSeek Auto-Ingest Pipeline...");
  const useFixture = process.argv.includes("--fixture");
  const dryRun = process.argv.includes("--dry-run");

  runIngestion({ useFixture, dryRun })
    .then((result) => {
      console.log("\n================ Ingestion Summary ================");
      console.log(`Total Fetched:            ${result.totalFetched}`);
      console.log(`Total Inserted (New):     ${result.totalInserted}`);
      console.log(`Total Updated (Existing): ${result.totalUpdated}`);
      console.log(`Duplicates Merged:        ${result.totalDuplicatesMerged}`);
      console.log(`Total in Dataset:         ${result.hackathons.length}`);
      console.log("====================================================\n");

      console.table(
        result.scrapeRuns.map((r) => ({
          Source: r.source,
          Fetched: r.fetched,
          Inserted: r.inserted,
          Updated: r.updated,
          Status: r.error ? `❌ ${r.error}` : "✅ Success",
        }))
      );
      process.exit(0);
    })
    .catch((err) => {
      console.error("Fatal ingestion error:", err);
      process.exit(1);
    });
}
