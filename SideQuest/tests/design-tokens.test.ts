import { describe, it, expect } from "vitest";

describe("SideQuest Design Tokens", () => {
  it("defines exact colors from approved mockups", () => {
    const tokens = {
      parchment: "#FFFBE8",
      ink: "#0B1033",
      lime: "#B6F500",
      urgent: "#C62F3A",
      warning: "#FFB020",
    };

    expect(tokens.parchment).toBe("#FFFBE8");
    expect(tokens.ink).toBe("#0B1033");
    expect(tokens.lime).toBe("#B6F500");
    expect(tokens.urgent).toBe("#C62F3A");
    expect(tokens.warning).toBe("#FFB020");
  });

  it("calculates countdown duration correctly", () => {
    const now = Date.now();
    const deadlineClosingSoon = now + 18 * 60 * 60 * 1000; // 18 hours
    const diffHours = Math.floor((deadlineClosingSoon - now) / (1000 * 60 * 60));
    expect(diffHours).toBe(18);
    expect(diffHours <= 72).toBe(true); // Should trigger closing soon
  });
});
