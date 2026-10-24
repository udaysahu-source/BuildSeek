import fs from "fs";
import path from "path";
import { RawItem, SourceAdapter, detectOrganizerType } from "./types";
import { Hackathon } from "@/lib/types";
import { generateRichDetails } from "@/lib/detail-generator";

export class DevpostAdapter implements SourceAdapter {
  name = "devpost";

  isEnabled(): boolean {
    return true; // Devpost is enabled by default
  }

  async fetchListings(useFixture: boolean = false): Promise<RawItem[]> {
    if (useFixture || process.env.NODE_ENV === "test") {
      const fixturePath = path.join(
        process.cwd(),
        "ingestion/fixtures/devpost.json"
      );
      if (fs.existsSync(fixturePath)) {
        const content = fs.readFileSync(fixturePath, "utf-8");
        const parsed = JSON.parse(content);
        return parsed.hackathons || parsed;
      }
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const res = await fetch("https://devpost.com/api/hackathons?page=1", {
        headers: {
          "User-Agent":
            "BuildSeekBot/1.0 (+https://buildseek.app; student hackathon aggregator)",
          Accept: "application/json",
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} from Devpost API`);
      }

      const json = await res.json();
      return json?.hackathons || [];
    } catch (err) {
      console.warn("Devpost live fetch failed, using fixture fallback if available:", err);
      const fixturePath = path.join(
        process.cwd(),
        "ingestion/fixtures/devpost.json"
      );
      if (fs.existsSync(fixturePath)) {
        const parsed = JSON.parse(fs.readFileSync(fixturePath, "utf-8"));
        return parsed.hackathons || parsed;
      }
      return [];
    }
  }

  normalize(raw: RawItem): Hackathon | null {
    const title = (raw.title || "").trim();
    const sourceUrl = (raw.url || "").trim();
    const sourceId = String(raw.id || raw.analytics_identifier || "").trim();

    if (!title || !sourceUrl || !sourceId) {
      return null;
    }

    const locationText = raw.displayed_location?.location?.toLowerCase() || "";
    const isOnline =
      locationText.includes("online") ||
      raw.displayed_location?.icon === "globe" ||
      !locationText;

    const mode = isOnline ? "online" : "offline";

    // Parse submission_period_dates (e.g. "Aug 31 - Oct 23, 2026")
    let regDeadline: string | null = null;
    let deadlineNote: string | null = null;
    let startDate: string | null = null;
    let endDate: string | null = null;

    if (raw.submission_period_dates) {
      const dateStr = String(raw.submission_period_dates).trim();
      const parts = dateStr.split(" - ");
      if (parts.length === 2) {
        const endPart = parts[1].trim();
        const yearMatch = endPart.match(/\b(202\d)\b/);
        const year = yearMatch ? yearMatch[1] : "2026";

        let startFull = parts[0].trim();
        if (!startFull.includes(year)) {
          startFull += `, ${year}`;
        }

        const startTimestamp = Date.parse(startFull);
        if (!isNaN(startTimestamp)) {
          startDate = new Date(startTimestamp).toISOString();
        }

        const endTimestamp = Date.parse(endPart);
        if (!isNaN(endTimestamp)) {
          const endDateObj = new Date(endTimestamp);
          // Set to end of day UTC
          endDateObj.setUTCHours(23, 59, 59, 0);
          regDeadline = endDateObj.toISOString();
          endDate = regDeadline;
          deadlineNote = `Official Devpost date: ${endPart} (check page for exact time)`;
        }
      } else {
        const singleTimestamp = Date.parse(dateStr);
        if (!isNaN(singleTimestamp)) {
          const d = new Date(singleTimestamp);
          d.setUTCHours(23, 59, 59, 0);
          regDeadline = d.toISOString();
          deadlineNote = `Official Devpost date: ${dateStr} (check page for exact time)`;
        }
      }
    }

    // Parse prize amount
    let prizeAmount: number | null = null;
    let prizeText: string | null = null;
    if (raw.prize_amount) {
      const cleanText = String(raw.prize_amount).replace(/<[^>]+>/g, "").trim();
      prizeText = cleanText;
      const digits = cleanText.replace(/[^0-9]/g, "");
      if (digits) {
        prizeAmount = parseInt(digits, 10);
      }
    }

    // Derived INR from USD
    const prizeAmountInr = prizeAmount ? Math.round(prizeAmount * 85) : null;

    const organizer = (raw.organization_name || "Devpost Partner").trim();
    const organizerType = detectOrganizerType(organizer);

    const tags = Array.isArray(raw.themes)
      ? raw.themes.map((t: any) =>
          typeof t === "string" ? t.toLowerCase() : String(t.name || "").toLowerCase()
        ).filter(Boolean)
      : ["hackathon", "global"];

    const imageUrl = raw.thumbnail_url
      ? raw.thumbnail_url.startsWith("//")
        ? `https:${raw.thumbnail_url}`
        : raw.thumbnail_url
      : null;

    const nowIso = new Date().toISOString();

    const rich = generateRichDetails({
      title,
      organizer,
      mode,
      prize_amount: prizeAmount,
      prize_amount_inr: prizeAmountInr,
      prize_text: prizeText,
      team_min: 1,
      team_max: null,
      tags,
      reg_deadline: regDeadline,
      start_date: startDate,
      end_date: endDate,
      eligibility_text: "Check official rules on Devpost for regional eligibility",
    });

    return {
      id: `dp-${sourceId}`.padEnd(36, "0").substring(0, 36),
      source: this.name,
      source_id: sourceId,
      title,
      organizer,
      organizer_type: organizerType,
      scope: "global",
      mode,
      country: null,
      city: null,
      state: null,
      venue: null,
      lat: null,
      lng: null,
      start_date: startDate,
      end_date: endDate,
      reg_start: startDate,
      reg_deadline: regDeadline,
      deadline_note: deadlineNote,
      deadline_precision: "date",
      fee_type: "unknown",
      fee_amount_inr: null,
      prize_text: prizeText,
      prize_amount: prizeAmount,
      prize_currency: "USD",
      prize_amount_inr: prizeAmountInr,
      team_min: 1,
      team_max: null,
      team_note: null,
      eligibility: { students_only: false },
      eligibility_text: "Check official rules on Devpost for regional eligibility",
      tags,
      source_url: sourceUrl,
      official_page: null,
      apply_url: raw.start_a_submission_url || sourceUrl,
      image_url: imageUrl,
      canonical_id: null,
      summary: rich.summary,
      description: rich.description,
      rounds: rich.rounds as any,
      tracks: rich.tracks as any,
      prizes_breakdown: rich.prizes_breakdown as any,
      submission_guidelines: rich.submission_guidelines,
      rules: rich.rules,
      judging_criteria: rich.judging_criteria as any,
      verified: true,
      data_confidence: "platform_listed",
      last_verified_at: nowIso.split("T")[0],
      needs_review: false,
      scope_assumed: false,
      hidden: false,
      is_user_submitted: false,
      created_at: nowIso,
      updated_at: nowIso,
      last_seen_at: nowIso,
    };
  }
}
