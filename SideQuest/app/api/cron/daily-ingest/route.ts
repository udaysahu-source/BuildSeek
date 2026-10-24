import { NextResponse } from "next/server";
import { runIngestion } from "@/ingestion/run";
import { logger } from "@/lib/security/logger";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // 60 seconds max timeout for Vercel functions

export async function GET(request: Request) {
  return handleIngest(request);
}

export async function POST(request: Request) {
  return handleIngest(request);
}

async function handleIngest(request: Request) {
  try {
    // Verify optional cron secret if configured
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      logger.warn("Unauthorized cron ingest attempt", { authHeader }, undefined, "cron");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    logger.info("Starting automated daily hackathon ingestion", undefined, "cron");
    const result = await runIngestion({ dryRun: false });

    return NextResponse.json({
      success: true,
      message: "Daily hackathon ingestion completed successfully",
      timestamp: new Date().toISOString(),
      summary: {
        totalFetched: result.totalFetched,
        totalInserted: result.totalInserted,
        totalUpdated: result.totalUpdated,
        totalDuplicatesMerged: result.totalDuplicatesMerged,
        totalInDataset: result.hackathons.length,
      },
      runs: result.scrapeRuns.map((r) => ({
        source: r.source,
        fetched: r.fetched,
        inserted: r.inserted,
        status: r.error ? "failed" : "success",
        error: r.error,
      })),
    });
  } catch (error: any) {
    logger.error("Daily cron ingestion failed", error, undefined, "cron");
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Internal server error during ingestion",
      },
      { status: 500 }
    );
  }
}
