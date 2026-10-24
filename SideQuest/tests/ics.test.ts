import { describe, it, expect } from "vitest";
import { generateIcsFeed } from "@/lib/ics";
import { SEED_HACKATHONS } from "@/seed/hackathons";

describe("generateIcsFeed", () => {
  it("generates a valid RFC 5545 iCalendar string", () => {
    const sample = [SEED_HACKATHONS[0]];
    const ics = generateIcsFeed(sample);

    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("VERSION:2.0");
    expect(ics).toContain("PRODID:-//BuildSeek//Hackathon Radar v1.0//EN");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain(`UID:reg-deadline-${sample[0].id}@sidequest.app`);
    expect(ics).toContain(`SUMMARY:⏰ [DEADLINE] ${sample[0].title.replace(/,/g, "\\,")}`);
    expect(ics).toContain("TRIGGER:-P1D");
    expect(ics).toContain("END:VCALENDAR");
  });
});
