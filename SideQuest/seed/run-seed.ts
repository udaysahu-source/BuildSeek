import fs from "fs";
import path from "path";
import { SEED_HACKATHONS } from "./hackathons";

function escapeSql(str: string | null | undefined): string {
  if (str === null || str === undefined) return "NULL";
  return `'${str.replace(/'/g, "''")}'`;
}

function generateSeedSql(): string {
  const statements: string[] = [
    "-- SideQuest Genuine Seed Data",
    "-- Verified real hackathons across platforms with genuine dates",
    "",
  ];

  for (const h of SEED_HACKATHONS) {
    const tagsArray = `ARRAY[${h.tags.map((t) => escapeSql(t)).join(", ")}]::text[]`;
    const eligibilityJson = escapeSql(JSON.stringify(h.eligibility));

    const sql = `INSERT INTO public.hackathons (
  id, source, source_id, title, organizer, description, summary,
  mode, city, state, start_date, end_date, reg_start, reg_deadline,
  prize_text, prize_amount_inr, team_min, team_max, eligibility,
  tags, source_url, verified, is_user_submitted, created_at, updated_at, last_seen_at
) VALUES (
  ${escapeSql(h.id)},
  ${escapeSql(h.source)},
  ${escapeSql(h.source_id)},
  ${escapeSql(h.title)},
  ${escapeSql(h.organizer)},
  ${escapeSql(h.description)},
  ${escapeSql(h.summary)},
  ${escapeSql(h.mode)},
  ${escapeSql(h.city)},
  ${escapeSql(h.state)},
  ${escapeSql(h.start_date)},
  ${escapeSql(h.end_date)},
  ${escapeSql(h.reg_start)},
  ${escapeSql(h.reg_deadline)},
  ${escapeSql(h.prize_text)},
  ${h.prize_amount_inr ?? 0},
  ${h.team_min},
  ${h.team_max},
  ${eligibilityJson}::jsonb,
  ${tagsArray},
  ${escapeSql(h.source_url)},
  ${h.verified},
  ${h.is_user_submitted},
  ${escapeSql(h.created_at)},
  ${escapeSql(h.updated_at)},
  ${escapeSql(h.last_seen_at)}
) ON CONFLICT (source, source_id) DO UPDATE SET
  title = EXCLUDED.title,
  organizer = EXCLUDED.organizer,
  description = EXCLUDED.description,
  summary = EXCLUDED.summary,
  reg_deadline = EXCLUDED.reg_deadline,
  prize_amount_inr = EXCLUDED.prize_amount_inr,
  tags = EXCLUDED.tags,
  last_seen_at = EXCLUDED.last_seen_at;`;

    statements.push(sql);
  }

  return statements.join("\n\n");
}

const migrationFilePath = path.join(
  __dirname,
  "../supabase/migrations/20261014000001_seed_hackathons.sql"
);

fs.writeFileSync(migrationFilePath, generateSeedSql(), "utf-8");
console.log(`Generated migration seed SQL at ${migrationFilePath}`);
