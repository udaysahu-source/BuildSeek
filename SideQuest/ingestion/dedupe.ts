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

/**
 * Determines whether two hackathons represent the same real-world event.
 * Rule:
 * 1. Trigram similarity of normalized title >= 0.8
 * 2. Start dates within 2 days (48 hours)
 */
export function areDuplicates(a: Hackathon, b: Hackathon): boolean {
  // If same source and source_id, handled by primary key constraint
  if (a.source === b.source && a.source_id === b.source_id) {
    return true;
  }

  const similarity = calculateTrigramSimilarity(a.title, b.title);
  if (similarity < 0.8) {
    return false;
  }

  // Check start date proximity within 2 days
  const timeA = new Date(a.start_date).getTime();
  const timeB = new Date(b.start_date).getTime();
  const diffDays = Math.abs(timeA - timeB) / (1000 * 60 * 60 * 24);

  return diffDays <= 2;
}

/**
 * Deduplicates an incoming list of hackathons against an existing list.
 * Links duplicates using canonical_id.
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
    const master = allMasterCandidates.find((m) => areDuplicates(item, m));

    if (master) {
      item.canonical_id = master.canonical_id || master.id;
      mergedDuplicates.push({ duplicate: item, masterId: item.canonical_id });
    } else {
      uniqueNew.push(item);
      allMasterCandidates.push(item);
    }
  }

  return { uniqueNew, mergedDuplicates };
}
