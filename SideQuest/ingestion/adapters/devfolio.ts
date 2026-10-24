import fs from "fs";
import path from "path";
import { RawItem, SourceAdapter, detectOrganizerType } from "./types";
import { Hackathon } from "@/lib/types";
import { generateRichDetails } from "@/lib/detail-generator";

export class DevfolioAdapter implements SourceAdapter {
  name = "devfolio";

  isEnabled(): boolean {
    // Experimental, off by default unless ENABLE_DEVFOLIO=1
    return process.env.ENABLE_DEVFOLIO === "1";
  }

  async fetchListings(useFixture: boolean = false): Promise<RawItem[]> {
    if (useFixture || process.env.NODE_ENV === "test") {
      const fixturePath = path.join(
        process.cwd(),
        "ingestion/fixtures/devfolio.json"
      );
      if (fs.existsSync(fixturePath)) {
        return JSON.parse(fs.readFileSync(fixturePath, "utf-8"));
      }
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const res = await fetch("https://api.devfolio.co/api/hackathons?filter=all", {
        headers: {
          "User-Agent":
            "BuildSeekBot/1.0 (+https://buildseek.app; student hackathon aggregator)",
          Accept: "application/json",
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} from Devfolio API`);
      }

      const json = await res.json();
      const results = json?.result || [];

      if (process.env.DEBUG_ADAPTER === "1" && results.length > 0) {
        console.log("DEBUG_ADAPTER [devfolio] raw item sample:", JSON.stringify(results[0], null, 2));
      }

      return results;
    } catch (err) {
      console.warn("Devfolio live fetch failed, using fixture fallback if available:", err);
      const fixturePath = path.join(
        process.cwd(),
        "ingestion/fixtures/devfolio.json"
      );
      if (fs.existsSync(fixturePath)) {
        return JSON.parse(fs.readFileSync(fixturePath, "utf-8"));
      }
      return [];
    }
  }

  normalize(raw: RawItem): Hackathon | null {
    const title = (raw.name || raw.title || "").trim();
    const sourceId = String(raw.slug || raw.uuid || raw.id || "").trim();
    const sourceUrl =
      raw.hackathon_setting_url ||
      (raw.slug ? `https://devfolio.co/${raw.slug}` : raw.url || "");

    if (!title || !sourceId || !sourceUrl) {
      return null;
    }

    const regDeadline =
      raw.reg_ends_at || raw.ends_at || raw.registration_end_date;
    const startDate = raw.starts_at || raw.start_date;
    const endDate = raw.ends_at || raw.end_date || startDate;
    const regStart =
      raw.reg_starts_at ||
      raw.starts_at ||
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const mode =
      raw.is_online === true || raw.mode === "online"
        ? "online"
        : raw.mode === "hybrid"
        ? "hybrid"
        : "offline";

    const prizeAmount =
      typeof raw.prize_inr === "number"
        ? raw.prize_inr
        : typeof raw.prize_amount === "number"
        ? raw.prize_amount
        : 0;

    const organizer = (raw.organizer_name || raw.organizer || "Devfolio Community").trim();
    const organizerType = detectOrganizerType(organizer);

    const tags = Array.isArray(raw.themes)
      ? raw.themes.map((t: any) =>
          typeof t === "string" ? t.toLowerCase() : String(t.name || "").toLowerCase()
        ).filter(Boolean)
      : ["hackathon", "devfolio"];

    const nowIso = new Date().toISOString();

    const rich = generateRichDetails({
      title,
      organizer,
      mode,
      city: raw.location || null,
      country: "India",
      prize_amount: prizeAmount > 0 ? prizeAmount : null,
      prize_amount_inr: prizeAmount > 0 ? prizeAmount : null,
      prize_text: raw.prize_pool || (prizeAmount > 0 ? `₹${prizeAmount.toLocaleString("en-IN")}` : null),
      team_min: raw.min_team_size ? Number(raw.min_team_size) : 1,
      team_max: raw.max_team_size ? Number(raw.max_team_size) : 4,
      tags,
      reg_deadline: regDeadline ? new Date(regDeadline).toISOString() : null,
      start_date: startDate ? new Date(startDate).toISOString() : null,
      end_date: endDate ? new Date(endDate).toISOString() : null,
      eligibility_text: "Builders and developers; see Devfolio rules",
    });

    return {
      id: `d-${sourceId}`.padEnd(36, "0").substring(0, 36),
      source: this.name,
      source_id: sourceId,
      title,
      organizer,
      organizer_type: organizerType,
      scope: "national",
      scope_assumed: true,
      mode,
      country: "India",
      city: raw.location || null,
      state: null,
      venue: null,
      lat: null,
      lng: null,
      start_date: startDate ? new Date(startDate).toISOString() : null,
      end_date: endDate ? new Date(endDate).toISOString() : null,
      reg_start: regStart ? new Date(regStart).toISOString() : null,
      reg_deadline: regDeadline ? new Date(regDeadline).toISOString() : null,
      deadline_note: "Devfolio listing: confirm rules and dates on official page",
      deadline_precision: "exact",
      fee_type: "free",
      fee_amount_inr: 0,
      prize_text: raw.prize_pool || (prizeAmount > 0 ? `₹${prizeAmount.toLocaleString("en-IN")}` : null),
      prize_amount: prizeAmount > 0 ? prizeAmount : null,
      prize_currency: "INR",
      prize_amount_inr: prizeAmount > 0 ? prizeAmount : null,
      team_min: raw.min_team_size ? Number(raw.min_team_size) : 1,
      team_max: raw.max_team_size ? Number(raw.max_team_size) : 4,
      team_note: null,
      eligibility: { students_only: true },
      eligibility_text: "Builders and developers; see Devfolio rules",
      tags,
      source_url: sourceUrl,
      official_page: null,
      apply_url: sourceUrl,
      image_url: raw.banner_url || null,
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
      needs_review: true, // Rows are marked needs_review as per spec
      hidden: false,
      is_user_submitted: false,
      created_at: nowIso,
      updated_at: nowIso,
      last_seen_at: nowIso,
    };
  }
}
