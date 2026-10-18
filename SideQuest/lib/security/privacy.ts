import { Hackathon } from "@/lib/types";

/**
 * Explicit list of safe public columns to query from the database.
 * Eliminates SELECT * over-fetching.
 */
export const PUBLIC_HACKATHON_COLUMNS = [
  "id",
  "source",
  "source_id",
  "title",
  "organizer",
  "organizer_type",
  "scope",
  "mode",
  "country",
  "state",
  "city",
  "venue",
  "lat",
  "lng",
  "start_date",
  "end_date",
  "reg_start",
  "reg_deadline",
  "deadline_note",
  "prize_text",
  "prize_currency",
  "prize_amount",
  "prize_amount_inr",
  "fee_type",
  "fee_amount_inr",
  "team_min",
  "team_max",
  "eligibility",
  "eligibility_text",
  "tags",
  "source_url",
  "official_page",
  "apply_url",
  "image_url",
  "verified",
  "data_confidence",
  "summary",
  "description",
].join(", ");

/**
 * Strips internal administrative metadata and submitter PII from a hackathon object
 * before returning it in an API response or server render.
 */
export function scrubHackathon<T extends Partial<Hackathon> & Record<string, any>>(
  item: T
): Partial<Hackathon> {
  const {
    submitted_by,
    contact_email,
    contact_telegram,
    needs_review,
    canonical_id,
    last_seen_at,
    fts,
    ...safeRecord
  } = item;

  return safeRecord;
}

/**
 * Strips sensitive auth tokens, salts, and private fields from profile objects.
 */
export function scrubProfile(profile: Record<string, any> | null | undefined) {
  if (!profile) return null;
  const { calendar_token, ...safeProfile } = profile;
  return safeProfile;
}

/**
 * Redacts common PII patterns (email, phone, tokens) from text and object representations.
 */
export function redactPII(input: any): any {
  if (typeof input === "string") {
    return input
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[REDACTED_EMAIL]")
      .replace(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, "[REDACTED_PHONE]")
      .replace(/(bearer\s+)[a-zA-Z0-9_.-]+/gi, "$1[REDACTED_TOKEN]")
      .replace(/(key=)[a-zA-Z0-9_.-]+/gi, "$1[REDACTED_KEY]");
  }

  if (Array.isArray(input)) {
    return input.map(redactPII);
  }

  if (input !== null && typeof input === "object") {
    const sanitized: Record<string, any> = {};
    for (const [key, val] of Object.entries(input)) {
      if (/password|secret|token|key|cookie|auth|credential/i.test(key)) {
        sanitized[key] = "[REDACTED_SECRET]";
      } else {
        sanitized[key] = redactPII(val);
      }
    }
    return sanitized;
  }

  return input;
}
