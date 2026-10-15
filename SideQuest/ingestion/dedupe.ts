import { Hackathon } from "@/lib/types";

/**
 * Normalizes title by stripping years, edition numbers, stop words, and punctuation.
 */
export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/\[sample\]/gi, "")
    .replace(/\b(202[0-9]|203[0-9])\b/g, "") // Strip year (2024-2030)
    .replace(/\b(v[0-9]+|[0-9]+\.[0-9]+|edition|annual|flagship)\b/g, "") // Strip editions
    .replace(/\b(hackathon|buildathon|sprint|challenge|codefest)\b/g, "") // Strip generic words
    .replace(/[^a-z0-9\s]/g, "") // Strip punctuation
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Computes trigram (3-gram) similarity between two strings (0.0 to 1.0).
 */
export function calculateTrigramSimilarity(strA: string, strB: string): number {
  const normA = normalizeTitle(strA);
  const normB = normalizeTitle(strB);

  if (normA === normB) return 1.0;
  if (!normA || !normB) return 0.0;

  // For very short strings where trigrams might be sparse
  if (normA.length < 3 || normB.length < 3) {
    return normA === normB || normA.includes(normB) || normB.includes(normA)
      ? 0.85
      : 0.0;
  }

  const getTrigrams = (str: string): Set<string> => {
    const trigrams = new Set<string>();
    for (let i = 0; i <= str.length - 3; i++) {
      trigrams.add(str.substring(i, i + 3));
    }
    return trigrams;
  };

  const trigramsA = getTrigrams(normA);
  const trigramsB = getTrigrams(normB);

  let intersection = 0;
  trigramsA.forEach((t) => {
    if (trigramsB.has(t)) intersection++;
  });

  const total = trigramsA.size + trigramsB.size;
  if (total === 0) return 0.0;

  return (2 * intersection) / total;
}

function cleanUrl(url?: string | null): string {
  if (!url) return "";
  return url.toLowerCase().replace(/^https?:\/\//, "").replace(/\/+$/, "").split("?")[0];
}

/**
 * Determines whether two hackathons represent the same real-world event.
 * Rule:
 * 1. Exact same source URL (stripped of scheme/trailing slash)
 * 2. Same source and source_id
 * 3. Trigram similarity of normalized title >= 0.8 and start/deadline date within 2 days
 */
export function areDuplicates(a: Hackathon, b: Hackathon): boolean {
  if (a.source === b.source && a.source_id === b.source_id) {
    return true;
  }

  const urlA = cleanUrl(a.source_url || a.official_page);
  const urlB = cleanUrl(b.source_url || b.official_page);
  if (urlA && urlB && urlA === urlB) {
    return true;
  }

  const similarity = calculateTrigramSimilarity(a.title, b.title);
  if (similarity < 0.8) {
    return false;
  }

  // Check start date proximity within 2 days if dates are stated
  if (a.start_date && b.start_date) {
    const timeA = new Date(a.start_date).getTime();
    const timeB = new Date(b.start_date).getTime();
    if (!isNaN(timeA) && !isNaN(timeB)) {
      const diffDays = Math.abs(timeA - timeB) / (1000 * 60 * 60 * 24);
      return diffDays <= 2;
    }
  }

  // Check reg_deadline proximity within 2 days
  if (a.reg_deadline && b.reg_deadline) {
    const timeA = new Date(a.reg_deadline).getTime();
    const timeB = new Date(b.reg_deadline).getTime();
    if (!isNaN(timeA) && !isNaN(timeB)) {
      const diffDays = Math.abs(timeA - timeB) / (1000 * 60 * 60 * 24);
      return diffDays <= 2;
    }
  }

  return similarity >= 0.9;
}

/**
 * Merges two hackathon records representing the same event.
 * The richer / primary record wins and gaps are filled.
 */
export function mergeHackathons(existingItem: Hackathon, incomingItem: Hackathon): Hackathon {
  // Primary confidence wins (verified_primary > platform_listed > unverified)
  const score = (h: Hackathon) => {
    let s = 0;
    if (h.data_confidence === "verified_primary") s += 100;
    else if (h.data_confidence === "platform_listed") s += 50;
    if (h.source === "manual") s += 80;
    if (h.reg_deadline) s += 10;
    if (h.prize_amount) s += 5;
    if (h.city) s += 5;
    if (h.eligibility_text) s += 5;
    if (h.image_url) s += 2;
    return s;
  };

  const primary = score(existingItem) >= score(incomingItem) ? existingItem : incomingItem;
  const secondary = primary === existingItem ? incomingItem : existingItem;

  // Conflict detection (e.g. significantly different prize amounts)
  let needsReview = Boolean(primary.needs_review || secondary.needs_review);
  if (
    primary.prize_amount &&
    secondary.prize_amount &&
    primary.prize_amount !== secondary.prize_amount
  ) {
    if (primary.data_confidence !== "verified_primary") {
      needsReview = true;
    }
  }

  const nowIso = new Date().toISOString();

  return {
    ...secondary,
    ...primary,
    // Fill gaps from secondary
    official_page: primary.official_page || secondary.official_page || null,
    apply_url: primary.apply_url || secondary.apply_url || null,
    image_url: primary.image_url || secondary.image_url || null,
    city: primary.city || secondary.city || null,
    state: primary.state || secondary.state || null,
    country: primary.country || secondary.country || null,
    venue: primary.venue || secondary.venue || null,
    lat: primary.lat ?? secondary.lat ?? null,
    lng: primary.lng ?? secondary.lng ?? null,
    deadline_note: primary.deadline_note || secondary.deadline_note || null,
    fee_type: primary.fee_type !== "unknown" ? primary.fee_type : secondary.fee_type,
    fee_amount_inr: primary.fee_amount_inr ?? secondary.fee_amount_inr ?? null,
    prize_amount: primary.prize_amount ?? secondary.prize_amount ?? null,
    prize_currency: primary.prize_currency || secondary.prize_currency || null,
    prize_amount_inr: primary.prize_amount_inr ?? secondary.prize_amount_inr ?? null,
    prize_text: primary.prize_text || secondary.prize_text || null,
    eligibility_text: primary.eligibility_text || secondary.eligibility_text || null,
    tags: Array.from(new Set([...(primary.tags || []), ...(secondary.tags || [])])),
    needs_review: needsReview,
    last_seen_at: nowIso,
    updated_at: nowIso,
  };
}

/**
 * Deduplicates and merges an incoming list of hackathons against an existing list.
 */
export function deduplicateListings(
  incoming: Hackathon[],
  existing: Hackathon[]
): {
  uniqueNew: Hackathon[];
  mergedDuplicates: { duplicate: Hackathon; masterId: string }[];
} {
  const allMasterCandidates = [...existing];
  const uniqueNew: Hackathon[] = [];
  const mergedDuplicates: { duplicate: Hackathon; masterId: string }[] = [];

  for (const item of incoming) {
    const masterIdx = allMasterCandidates.findIndex((m) => areDuplicates(item, m));

    if (masterIdx >= 0) {
      const master = allMasterCandidates[masterIdx];
      const merged = mergeHackathons(master, item);
      allMasterCandidates[masterIdx] = merged;
      item.canonical_id = master.canonical_id || master.id;
      mergedDuplicates.push({ duplicate: merged, masterId: item.canonical_id });
    } else {
      uniqueNew.push(item);
      allMasterCandidates.push(item);
    }
  }

  return { uniqueNew, mergedDuplicates };
}
