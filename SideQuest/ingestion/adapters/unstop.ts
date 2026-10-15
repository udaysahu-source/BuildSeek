import fs from "fs";
import path from "path";
import { RawItem, SourceAdapter, detectOrganizerType } from "./types";
import { Hackathon } from "@/lib/types";
import { generateRichDetails } from "@/lib/detail-generator";

export class UnstopAdapter implements SourceAdapter {
  name = "unstop";

  isEnabled(): boolean {
    return process.env.ENABLE_UNSTOP !== "0";
  }

  async fetchListings(useFixture: boolean = false): Promise<RawItem[]> {
    if (useFixture || process.env.NODE_ENV === "test") {
      const fixturePath = path.join(
        process.cwd(),
        "ingestion/fixtures/unstop.json"
      );
      if (fs.existsSync(fixturePath)) {
        const content = fs.readFileSync(fixturePath, "utf-8");
        return JSON.parse(content);
      }
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(
        "https://unstop.com/api/public/opportunity/search-result?opportunity=hackathons&per_page=50",
        {
          headers: {
            "User-Agent":
              "SideQuestBot/1.0 (+https://sidequest.app; student hackathon aggregator)",
            Accept: "application/json",
          },
          signal: controller.signal,
        }
      );
      clearTimeout(timeout);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} from Unstop API`);
      }

      const json = await res.json();
      return json?.data?.data || [];
    } catch (err) {
      console.warn("Unstop live fetch failed, using fixture fallback if available:", err);
      const fixturePath = path.join(
        process.cwd(),
        "ingestion/fixtures/unstop.json"
      );
      if (fs.existsSync(fixturePath)) {
        return JSON.parse(fs.readFileSync(fixturePath, "utf-8"));
      }
      return [];
    }
  }

  normalize(raw: RawItem): Hackathon | null {
    const title = (raw.title || "").trim();
    let sourceUrl = (raw.public_url || raw.url || "").trim();
    if (sourceUrl && !sourceUrl.startsWith("http")) {
      sourceUrl = `https://unstop.com/${sourceUrl.replace(/^\/+/, "")}`;
    }
    const sourceId = String(raw.id || raw.source_id || "").trim();

    if (!title || !sourceUrl || !sourceId) {
      return null;
    }

    const regDeadline =
      raw.end_date || raw.regn_end_date || raw.registration_end_date || raw.reg_deadline;
    const startDate =
      raw.start_date || raw.starts_at || raw.approved_date || raw.updated_at || new Date().toISOString();
    const endDate = raw.end_date || raw.ends_at || regDeadline;
    const regStart =
      raw.registration_start_date ||
      raw.approved_date ||
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    if (!regDeadline) {
      return null;
    }

    const mode =
      raw.region_type === "online" || raw.mode === "online" || raw.region === "online"
        ? "online"
        : raw.region_type === "hybrid" || raw.mode === "hybrid" || raw.region === "hybrid"
        ? "hybrid"
        : "offline";

    const prizeAmount =
      typeof raw.prize_amount === "number"
        ? raw.prize_amount
        : raw.prizes
        ? parseInt(String(raw.prizes).replace(/[^0-9]/g, ""), 10) || 0
        : 0;

    const organizer = (raw.organisation?.name || raw.organisation || raw.organizer || "Unstop Organizers").trim();
    const organizerType = detectOrganizerType(organizer);

    // Fee calculation
    let feeType: "free" | "paid" | "unknown" = "unknown";
    let feeAmountInr: number | null = null;
    if (raw.is_free === true || raw.fee === 0 || raw.regn_fee === 0) {
      feeType = "free";
      feeAmountInr = 0;
    } else if (raw.is_free === false || (raw.regn_fee && raw.regn_fee > 0)) {
      feeType = "paid";
      feeAmountInr = Number(raw.regn_fee) || null;
    }

    const tags = Array.isArray(raw.tags)
      ? raw.tags.map((t: any) =>
          typeof t === "string" ? t.toLowerCase() : String(t.name || "").toLowerCase()
        ).filter(Boolean)
      : ["hackathon", "india"];

    const nowIso = new Date().toISOString();

    const rich = generateRichDetails({
      title,
      organizer,
      mode,
      city: raw.city || null,
      state: raw.state || null,
      country: "India",
      prize_amount: prizeAmount > 0 ? prizeAmount : null,
      prize_amount_inr: prizeAmount > 0 ? prizeAmount : null,
      prize_text: raw.prizes || (prizeAmount > 0 ? `₹${prizeAmount.toLocaleString("en-IN")}` : null),
      team_min: raw.team_min ? Number(raw.team_min) : 1,
      team_max: raw.team_max ? Number(raw.team_max) : 4,
      tags,
      reg_deadline: new Date(regDeadline).toISOString(),
      start_date: new Date(startDate).toISOString(),
      end_date: new Date(endDate).toISOString(),
      eligibility_text: "College and university students in India (check Unstop eligibility tabs)",
      description: raw.details || raw.description || null,
    });

    return {
      id: `u-${sourceId}`.padEnd(36, "0").substring(0, 36),
      source: this.name,
      source_id: sourceId,
      title,
      organizer,
      organizer_type: organizerType,
      scope: "national",
      scope_assumed: true, // Rows from Unstop have scope_assumed: true
      mode,
      country: "India",
      city: raw.city || null,
      state: raw.state || null,
      venue: raw.venue || null,
      lat: null,
      lng: null,
      start_date: new Date(startDate).toISOString(),
      end_date: new Date(endDate).toISOString(),
      reg_start: new Date(regStart).toISOString(),
      reg_deadline: new Date(regDeadline).toISOString(),
      deadline_note: "Per Unstop listing: check page for submission round details",
      deadline_precision: "exact",
      fee_type: feeType,
      fee_amount_inr: feeAmountInr,
      prize_text: raw.prizes || (prizeAmount > 0 ? `₹${prizeAmount.toLocaleString("en-IN")}` : null),
      prize_amount: prizeAmount > 0 ? prizeAmount : null,
      prize_currency: "INR",
      prize_amount_inr: prizeAmount > 0 ? prizeAmount : null,
      team_min: raw.team_min ? Number(raw.team_min) : 1,
      team_max: raw.team_max ? Number(raw.team_max) : 4,
      team_note: null,
      eligibility: { students_only: true },
      eligibility_text: "College and university students in India (check Unstop eligibility tabs)",
      tags,
      source_url: sourceUrl,
      official_page: null,
      apply_url: sourceUrl,
      image_url: raw.banner_image || raw.logo_url || null,
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
      hidden: false,
      is_user_submitted: false,
      created_at: nowIso,
      updated_at: nowIso,
      last_seen_at: nowIso,
    };
  }
}
