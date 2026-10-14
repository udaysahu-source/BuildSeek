import { describe, it, expect } from "vitest";
import { computeHackathonStatus, formatDeadlineCountdown } from "@/lib/status";

describe("computeHackathonStatus", () => {
  const baseNow = new Date("2026-10-15T12:00:00Z");

  it("returns upcoming when now is before reg_start", () => {
    const regStart = "2026-10-16T00:00:00Z";
    const regDeadline = "2026-10-25T00:00:00Z";
    expect(computeHackathonStatus(regStart, regDeadline, baseNow)).toBe("upcoming");
  });

  it("returns closing_soon when registration ends in <= 72 hours", () => {
    const regStart = "2026-10-01T00:00:00Z";
    // 48 hours remaining (<= 72)
    const regDeadline = "2026-10-17T12:00:00Z";
    expect(computeHackathonStatus(regStart, regDeadline, baseNow)).toBe("closing_soon");

    // Exactly 72 hours remaining
    const regDeadline72 = "2026-10-18T12:00:00Z";
    expect(computeHackathonStatus(regStart, regDeadline72, baseNow)).toBe("closing_soon");

    // 2 hours remaining
    const regDeadline2h = "2026-10-15T14:00:00Z";
    expect(computeHackathonStatus(regStart, regDeadline2h, baseNow)).toBe("closing_soon");
  });

  it("returns open when registration has started and > 72 hours remaining", () => {
    const regStart = "2026-10-01T00:00:00Z";
    // 73 hours remaining
    const regDeadline = "2026-10-18T13:00:00Z";
    expect(computeHackathonStatus(regStart, regDeadline, baseNow)).toBe("open");
  });

  it("returns closed when registration deadline has passed", () => {
    const regStart = "2026-10-01T00:00:00Z";
    const regDeadline = "2026-10-15T11:59:59Z";
    expect(computeHackathonStatus(regStart, regDeadline, baseNow)).toBe("closed");
  });
});

describe("formatDeadlineCountdown", () => {
  const baseNow = new Date("2026-10-15T12:00:00Z");

  it("formats closed deadline correctly", () => {
    const result = formatDeadlineCountdown("2026-10-15T11:00:00Z", baseNow);
    expect(result.isClosed).toBe(true);
    expect(result.label).toBe("Registration closed");
  });

  it("formats hours and minutes when deadline is within 24 hours", () => {
    const result = formatDeadlineCountdown("2026-10-15T18:30:00Z", baseNow);
    expect(result.isClosingSoon).toBe(true);
    expect(result.label).toBe("Ends in 6h 30m");
  });
});
