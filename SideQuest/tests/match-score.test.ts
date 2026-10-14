import { describe, it, expect } from "vitest";
import { calculateMatchScore } from "@/lib/match-score";
import { SEED_HACKATHONS } from "@/seed/hackathons";

describe("calculateMatchScore", () => {
  it("scores higher for overlapping skills and city fit", () => {
    const hackathon = SEED_HACKATHONS[0]; // Bengaluru, tags: ai, agents, bengaluru, python

    const highMatchProfile = {
      skills: ["ai", "python"],
      year: 3,
      city: "Bengaluru",
    };

    const lowMatchProfile = {
      skills: ["solidity", "rust"],
      year: 1,
      city: "Kolkata",
    };

    const highScore = calculateMatchScore(hackathon, highMatchProfile);
    const lowScore = calculateMatchScore(hackathon, lowMatchProfile);

    expect(highScore.score).toBeGreaterThan(lowScore.score);
    expect(highScore.reasons.length).toBeGreaterThan(0);
  });
});
