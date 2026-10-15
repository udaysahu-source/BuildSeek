import fs from "fs";
import path from "path";
import { RawItem, SourceAdapter, detectOrganizerType } from "./types";
import { Hackathon } from "@/lib/types";
import { generateRichDetails } from "@/lib/detail-generator";

export class Hack2skillAdapter implements SourceAdapter {
  name = "hack2skill";

  isEnabled(): boolean {
    // Discovery only, off by default unless ENABLE_HACK2SKILL=1
    return process.env.ENABLE_HACK2SKILL === "1";
  }

  async fetchListings(useFixture: boolean = false): Promise<RawItem[]> {
    if (useFixture || process.env.NODE_ENV === "test") {
      const fixturePath = path.join(
        process.cwd(),
        "ingestion/fixtures/hack2skill.json"
      );
      if (fs.existsSync(fixturePath)) {
        return JSON.parse(fs.readFileSync(fixturePath, "utf-8"));
      }
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const res = await fetch("https://hack2skill.com/sitemap.xml", {
        headers: {
          "User-Agent":
            "SideQuestBot/1.0 (+https://sidequest.app; student hackathon aggregator)",
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} from Hack2skill`);
      }

      const xml = await res.text();
      // Extract event URLs like <loc>https://hack2skill.com/event/xyz</loc>
      const matches = xml.match(/<loc>(https:\/\/hack2skill\.com\/[a-zA-Z0-9\-_]+)<\/loc>/g) || [];
      const items: RawItem[] = [];

      for (const m of matches.slice(0, 15)) {
        const url = m.replace(/<\/?loc>/g, "");
        const slug = url.split("/").pop() || "";
        if (slug && !["about", "contact", "privacy", "terms", "blog"].includes(slug)) {
          const title = slug
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");
          items.push({
            slug,
            url,
            title,
          });
        }
      }

      return items;
    } catch (err) {
      console.warn("Hack2skill sitemap fetch failed:", err);
      return [];
    }
  }

  normalize(raw: RawItem): Hackathon | null {
    const title = (raw.title || "").trim();
    const sourceUrl = (raw.url || "").trim();
    const sourceId = String(raw.slug || raw.id || "").trim();

    if (!title || !sourceUrl || !sourceId) {
      return null;
    }

    const nowIso = new Date().toISOString();

    const rich = generateRichDetails({
      title,
      organizer: "Hack2skill Event Host",
      mode: "hybrid",
      tags: ["hackathon", "hack2skill"],
      eligibility_text: "Check official page on Hack2skill",
    });

    return {
      id: `h2s-${sourceId}`.padEnd(36, "0").substring(0, 36),
      source: this.name,
      source_id: sourceId,
      title,
      organizer: "Hack2skill Event Host",
      organizer_type: "community",
      scope: "national",
      scope_assumed: true,
      mode: "hybrid",
      country: "India",
      city: null,
      state: null,
      venue: null,
      lat: null,
      lng: null,
      start_date: null,
      end_date: null,
      reg_start: null,
      reg_deadline: null, // Discovery only: no deadline stated
      deadline_note: "Hack2skill discovery only: event dates not structured, check official page",
      deadline_precision: "date",
      fee_type: "unknown",
      fee_amount_inr: null,
      prize_text: null,
      prize_amount: null,
      prize_currency: null,
      prize_amount_inr: null,
      team_min: 1,
      team_max: null,
      team_note: null,
      eligibility: { students_only: false },
      eligibility_text: "Check official page on Hack2skill",
      tags: ["hackathon", "hack2skill"],
      source_url: sourceUrl,
      official_page: null,
      apply_url: sourceUrl,
      image_url: null,
      canonical_id: null,
      summary: rich.summary,
      description: rich.description,
      rounds: rich.rounds as any,
      tracks: rich.tracks as any,
      prizes_breakdown: rich.prizes_breakdown as any,
      submission_guidelines: rich.submission_guidelines,
      rules: rich.rules,
      judging_criteria: rich.judging_criteria as any,
      verified: false,
      data_confidence: "unverified",
      last_verified_at: null,
      needs_review: true, // Rows have no deadline and are marked needs_review per spec
      hidden: false,
      is_user_submitted: false,
      created_at: nowIso,
      updated_at: nowIso,
      last_seen_at: nowIso,
    };
  }
}
