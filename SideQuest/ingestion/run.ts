import { UnstopAdapter } from "./adapters/unstop";
import { DevfolioAdapter } from "./adapters/devfolio";
import { SourceAdapter } from "./adapters/types";
import { deduplicateListings } from "./dedupe";
import { Hackathon, ScrapeRun } from "@/lib/types";
import { SEED_HACKATHONS } from "@/seed/hackathons";
import { isSupabaseConfigured, getSupabaseClient } from "@/lib/supabase";

export interface IngestRunResult {
  scrapeRuns: ScrapeRun[];
  totalFetched: number;
  totalInserted: number;
  totalUpdated: number;
  totalDuplicatesMerged: number;
}

export async function runIngestion(useFixture: boolean = false): Promise<IngestRunResult> {
  const adapters: SourceAdapter[] = [new UnstopAdapter(), new DevfolioAdapter()];
  const scrapeRuns: ScrapeRun[] = [];

  let totalFetched = 0;
  let totalInserted = 0;
  let totalUpdated = 0;
  let totalDuplicatesMerged = 0;

  const existingHackathons: Hackathon[] = [...SEED_HACKATHONS];

  // If Supabase is connected, load current active hackathons
  if (isSupabaseConfigured) {
    try {
      const supabase = getSupabaseClient();
      const { data } = await supabase.from("hackathons").select("*");
      if (data && data.length > 0) {
        existingHackathons.splice(0, existingHackathons.length, ...data);
      }
    } catch (err) {
      console.warn("Could not load existing hackathons from Supabase:", err);
    }
  }

  for (const adapter of adapters) {
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

    // Perform upsert
    for (const item of [...uniqueNew, ...mergedDuplicates.map((m) => m.duplicate)]) {
      const existingIdx = existingHackathons.findIndex(
        (e) => e.source === item.source && e.source_id === item.source_id
      );

      if (existingIdx >= 0) {
        existingHackathons[existingIdx] = {
          ...existingHackathons[existingIdx],
          ...item,
          last_seen_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        updated++;
      } else {
        existingHackathons.push(item);
        inserted++;
      }

      // If Supabase is active, execute real upsert
      if (isSupabaseConfigured) {
        try {
          const supabase = getSupabaseClient();
          await supabase.from("hackathons").upsert(item, {
            onConflict: "source,source_id",
          });
        } catch (e) {
          // ignore error in upsert loop
        }
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

    // Save scrape_run in Supabase if configured
    if (isSupabaseConfigured) {
      try {
        const supabase = getSupabaseClient();
        await supabase.from("scrape_runs").insert(runLog);
      } catch (e) {}
    }
  }

  // Hide listings not seen for 14 days
  const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
  for (const h of existingHackathons) {
    if (new Date(h.last_seen_at).getTime() < fourteenDaysAgo) {
      h.verified = false; // Hidden from default active views
    }
  }

  return {
    scrapeRuns,
    totalFetched,
    totalInserted,
    totalUpdated,
    totalDuplicatesMerged,
  };
}

// Direct CLI execution
if (require.main === module || process.argv[1]?.includes("run.ts")) {
  console.log("🚀 Starting SideQuest Ingestion Job...");
  const useFixture = process.argv.includes("--fixture");

  runIngestion(useFixture)
    .then((result) => {
      console.log("\n================ Ingestion Summary ================");
      console.log(`Total Fetched:            ${result.totalFetched}`);
      console.log(`Total Inserted (New):     ${result.totalInserted}`);
      console.log(`Total Updated (Existing): ${result.totalUpdated}`);
      console.log(`Duplicates Merged:        ${result.totalDuplicatesMerged}`);
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
