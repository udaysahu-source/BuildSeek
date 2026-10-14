import fs from "fs";
import path from "path";
import { RawItem, SourceAdapter } from "./types";
import { Hackathon } from "@/lib/types";

export class DevfolioAdapter implements SourceAdapter {
  name = "devfolio";

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
            "SideQuestBot/1.0 (+https://sidequest.app; student hackathon aggregator)",
          Accept: "application/json",
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} from Devfolio API`);
      }

      const json = await res.json();
      return json?.result || [];
    } catch (err) {
      console.warn("Devfolio live fetch failed, using fixture fallback:", err);
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

    if (!regDeadline || !startDate) {
      return null;
    }

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

    const tags = Array.isArray(raw.themes)
      ? raw.themes.map((t: any) =>
          typeof t === "string" ? t.toLowerCase() : String(t.name || "").toLowerCase()
        ).filter(Boolean)
      : ["hackathon", "devfolio"];

    const nowIso = new Date().toISOString();

    return {
      id: `d-${sourceId}`.padEnd(36, "0").substring(0, 36),
      source: this.name,
      source_id: sourceId,
      title,
      organizer: (raw.organizer_name || raw.organizer || "Devfolio Community").trim(),
      description: raw.desc || raw.description || null,
      summary: raw.desc ? raw.desc.slice(0, 160) : null,
      mode,
      city: raw.location || null,
      state: null,
      start_date: new Date(startDate).toISOString(),
      end_date: new Date(endDate).toISOString(),
      reg_start: new Date(regStart).toISOString(),
      reg_deadline: new Date(regDeadline).toISOString(),
      prize_text: raw.prize_pool || (prizeAmount > 0 ? `₹${prizeAmount.toLocaleString("en-IN")}` : null),
      prize_amount_inr: prizeAmount,
      team_min: raw.min_team_size ? Number(raw.min_team_size) : 1,
      team_max: raw.max_team_size ? Number(raw.max_team_size) : 4,
      eligibility: { students_only: true },
      tags,
      source_url: sourceUrl,
      image_url: raw.banner_url || null,
      canonical_id: null,
      verified: true,
      is_user_submitted: false,
      created_at: nowIso,
      updated_at: nowIso,
      last_seen_at: nowIso,
    };
  }
}
