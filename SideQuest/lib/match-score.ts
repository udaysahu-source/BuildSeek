import { Hackathon } from "./types";

interface UserProfileContext {
  skills: string[];
  year?: number;
  city?: string;
}

/**
 * Computes recommendation match score (0 to 100) based on:
 * - 45% Skill / Tag overlap
 * - 20% Eligibility fit
 * - 20% Deadline urgency (higher when closing soon but still open)
 * - 15% Normalized prize pool
 */
export function calculateMatchScore(
  hackathon: Hackathon,
  profile: UserProfileContext,
  maxPrizeInList: number = 1000000
): { score: number; reasons: string[] } {
  const reasons: string[] = [];

  // 1. Skill Overlap (0 to 1.0)
  let skillOverlap = 0;
  if (profile.skills.length > 0 && hackathon.tags.length > 0) {
    const userSkills = profile.skills.map((s) => s.toLowerCase());
    const matched = hackathon.tags.filter((t) =>
      userSkills.includes(t.toLowerCase())
    );
    skillOverlap = Math.min(1.0, matched.length / Math.min(3, userSkills.length));
    if (matched.length > 0) {
      reasons.push(`Matches your skills: ${matched.slice(0, 2).join(", ")}`);
    }
  }

  // 2. Eligibility Fit (0 or 1.0)
  let eligibilityFit = 1.0;
  if (hackathon.eligibility.min_year && profile.year) {
    if (profile.year < hackathon.eligibility.min_year) {
      eligibilityFit = 0.3;
    }
  }
  if (
    hackathon.mode === "offline" &&
    hackathon.city &&
    profile.city &&
    hackathon.city.toLowerCase() === profile.city.toLowerCase()
  ) {
    reasons.push(`In your city (${hackathon.city})`);
    eligibilityFit = Math.min(1.0, eligibilityFit + 0.2);
  }

  // 3. Deadline Urgency (0 to 1.0)
  const now = Date.now();
  const deadline = new Date(hackathon.reg_deadline).getTime();
  const msRemaining = deadline - now;
  let deadlineUrgency = 0.5;

  if (msRemaining <= 0) {
    deadlineUrgency = 0; // closed
  } else {
    const hoursRemaining = msRemaining / (1000 * 60 * 60);
    if (hoursRemaining <= 72) {
      deadlineUrgency = 1.0; // High urgency: closing soon!
      reasons.push("Closing soon");
    } else if (hoursRemaining <= 168) {
      deadlineUrgency = 0.8; // 1 week
    } else {
      deadlineUrgency = 0.4;
    }
  }

  // 4. Normalized Prize (0 to 1.0)
  const prize = hackathon.prize_amount_inr || 0;
  const prizeNorm = Math.min(1.0, prize / Math.max(1, maxPrizeInList));
  if (prize >= 300000) {
    reasons.push("High prize pool");
  }

  const rawScore =
    100 *
    (0.45 * skillOverlap +
      0.20 * eligibilityFit +
      0.20 * deadlineUrgency +
      0.15 * prizeNorm);

  const finalScore = Math.max(0, Math.min(100, Math.round(rawScore)));

  return {
    score: finalScore,
    reasons,
  };
}
