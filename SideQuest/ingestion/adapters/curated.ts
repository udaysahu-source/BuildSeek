import fs from "fs";
import path from "path";
import { RawItem, SourceAdapter, detectOrganizerType } from "./types";
import { Hackathon } from "@/lib/types";

export class CuratedAdapter implements SourceAdapter {
  name = "curated";

  isEnabled(): boolean {
    return true;
  }

  async fetchListings(useFixture: boolean = false): Promise<RawItem[]> {
    if (useFixture || process.env.NODE_ENV === "test") {
      const fixturePath = path.join(
        process.cwd(),
        "ingestion/fixtures/curated.json"
      );
      if (fs.existsSync(fixturePath)) {
        const parsed = JSON.parse(fs.readFileSync(fixturePath, "utf-8"));
        return parsed.hackathons || [];
      }
    }

    const curatedDir = path.join(process.cwd(), "data/curated");
    if (!fs.existsSync(curatedDir)) {
      return [];
    }

    const items: RawItem[] = [];
    const files = fs.readdirSync(curatedDir);

    for (const file of files) {
      if (file.endsWith(".json")) {
        try {
          const filePath = path.join(curatedDir, file);
          const raw = fs.readFileSync(filePath, "utf-8");
          const parsed = JSON.parse(raw);
          const list = Array.isArray(parsed)
            ? parsed
            : Array.isArray(parsed?.hackathons)
            ? parsed.hackathons
            : [];
          items.push(...list);
        } catch (err) {
          console.warn(`Error reading curated file ${file}:`, err);
        }
      }
    }

    return items;
  }

  normalize(raw: RawItem): Hackathon | null {
    const title = (raw.title || "").trim();
    const sourceUrl = (raw.source_url || raw.official_page || "").trim();
    const sourceId = String(raw.source_id || title.toLowerCase().replace(/[^a-z0-9]/g, "-")).trim();

    // Required: title and source_url
    if (!title || !sourceUrl) {
      return null;
    }

    const nowIso = new Date().toISOString();
    const organizer = (raw.organizer || "Independent Organizer").trim();
    const organizerType = raw.organizer_type || detectOrganizerType(organizer);

    return {
      id: raw.id || `c-${sourceId}`.padEnd(36, "0").substring(0, 36),
      source: raw.source || "manual",
      source_id: sourceId,
      title,
      organizer,
      organizer_type: organizerType,
      scope: raw.scope || "global",
      mode: raw.mode || "online",
      country: raw.country ?? null,
      state: raw.state ?? null,
      city: raw.city ?? null,
      venue: raw.venue ?? null,
      lat: raw.lat ?? null,
      lng: raw.lng ?? null,
      start_date: raw.start_date ?? null,
      end_date: raw.end_date ?? null,
      reg_start: raw.reg_start ?? null,
      reg_deadline: raw.reg_deadline ?? null,
      deadline_note: raw.deadline_note ?? null,
      deadline_precision: raw.deadline_precision || (raw.reg_deadline && raw.reg_deadline.length <= 10 ? "date" : "exact"),
      fee_type: raw.fee_type || "unknown",
      fee_amount_inr: raw.fee_amount_inr ?? null,
      prize_text: raw.prize_text ?? null,
      prize_amount: raw.prize_amount ?? null,
      prize_currency: raw.prize_currency ?? null,
      prize_amount_inr: raw.prize_amount_inr ?? null,
      team_min: raw.team_min ?? 1,
      team_max: raw.team_max ?? null,
      team_note: raw.team_note ?? null,
      eligibility: raw.eligibility ?? { students_only: false },
      eligibility_text: raw.eligibility_text ?? null,
      tags: Array.isArray(raw.tags) ? raw.tags : ["hackathon"],
      source_url: sourceUrl,
      official_page: raw.official_page ?? null,
      apply_url: raw.apply_url ?? null,
      image_url: raw.image_url ?? null,
      canonical_id: raw.canonical_id ?? null,
      verified: raw.verified ?? (raw.data_confidence === "verified_primary"),
      data_confidence: raw.data_confidence || "verified_primary",
      last_verified_at: raw.last_verified_at || nowIso.split("T")[0],
      needs_review: Boolean(raw.needs_review),
      scope_assumed: Boolean(raw.scope_assumed),
      hidden: Boolean(raw.hidden),
      is_user_submitted: Boolean(raw.is_user_submitted),
      created_at: raw.created_at || nowIso,
      updated_at: raw.updated_at || nowIso,
      last_seen_at: nowIso,
    };
  }
}
