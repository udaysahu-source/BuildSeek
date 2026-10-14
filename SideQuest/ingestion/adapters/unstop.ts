import fs from "fs";
import path from "path";
import { RawItem, SourceAdapter } from "./types";
import { Hackathon } from "@/lib/types";

export class UnstopAdapter implements SourceAdapter {
  name = "unstop";

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
      // Unstop public opportunities API
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(
        "https://unstop.com/api/public/opportunity/search-result?opportunity=hackathons&per_page=20",
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
      console.warn("Unstop live fetch failed, using fixture fallback:", err);
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
    const sourceUrl = (raw.public_url || raw.url || "").trim();
    const sourceId = String(raw.id || raw.source_id || "").trim();

    // Required field validation (FR-2 / workflow)
    if (!title || !sourceUrl || !sourceId) {
      return null;
    }

    const regDeadline =
      raw.registration_end_date || raw.reg_deadline || raw.end_date;
    const startDate =
      raw.start_date || raw.starts_at || raw.registration_end_date;
    const endDate = raw.end_date || raw.ends_at || startDate;
    const regStart =
      raw.registration_start_date ||
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    if (!regDeadline || !startDate) {
      return null;
    }

    const mode =
      raw.region_type === "online" || raw.mode === "online"
        ? "online"
        : raw.region_type === "hybrid" || raw.mode === "hybrid"
        ? "hybrid"
        : "offline";

    const prizeAmount =
      typeof raw.prize_amount === "number"
        ? raw.prize_amount
        : raw.prizes
        ? parseInt(String(raw.prizes).replace(/[^0-9]/g, ""), 10) || 0
        : 0;

    const tags = Array.isArray(raw.tags)
      ? raw.tags.map((t: any) =>
          typeof t === "string" ? t.toLowerCase() : String(t.name || "").toLowerCase()
        ).filter(Boolean)
      : ["hackathon"];

    const nowIso = new Date().toISOString();

    return {
      id: `u-${sourceId}`.padEnd(36, "0").substring(0, 36),
      source: this.name,
      source_id: sourceId,
      title,
      organizer: (raw.organisation || raw.organizer || "Unstop Organizers").trim(),
      description: raw.details || raw.description || null,
      summary: raw.summary || (raw.details ? raw.details.slice(0, 160) : null),
      mode,
      city: raw.city || null,
      state: raw.state || null,
      start_date: new Date(startDate).toISOString(),
      end_date: new Date(endDate).toISOString(),
      reg_start: new Date(regStart).toISOString(),
      reg_deadline: new Date(regDeadline).toISOString(),
      prize_text: raw.prizes || (prizeAmount > 0 ? `₹${prizeAmount.toLocaleString("en-IN")}` : null),
      prize_amount_inr: prizeAmount,
      team_min: raw.team_min ? Number(raw.team_min) : 1,
      team_max: raw.team_max ? Number(raw.team_max) : 4,
      eligibility: { students_only: true },
      tags,
      source_url: sourceUrl,
      image_url: raw.banner_image || null,
      canonical_id: null,
      verified: true,
      is_user_submitted: false,
      created_at: nowIso,
      updated_at: nowIso,
      last_seen_at: nowIso,
    };
  }
}
