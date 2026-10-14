import { describe, it, expect } from "vitest";
import {
  getStatus,
  countdown,
  statusLabel,
  filterHackathons,
  HOUR,
  type HackathonUI,
} from "@/lib/hackathons";
import { questTab, questGroups } from "@/lib/quests";

describe("Hackathon UI Date & Filter Logic", () => {
  const now = Date.parse("2026-10-14T11:00:00Z");

  const sampleEvent: HackathonUI = {
    id: "test-1",
    title: "Buildverse 2026",
    organizer: "Nexus Institute",
    source: "via Devfolio",
    source_url: "https://example.com",
    mode: "online",
    city: "Pan India",
    tags: ["AI / ML", "Web development"],
    prize_amount_inr: 200000,
    team_min: 2,
    team_max: 4,
    reg_start: new Date(now - 7 * 24 * HOUR).toISOString(),
    reg_deadline: new Date(now + 48 * HOUR).toISOString(), // 48h left -> closing-soon
    start_date: new Date(now + 72 * HOUR).toISOString(),
    end_date: new Date(now + 120 * HOUR).toISOString(),
    eligibility: "College students only",
    description: "Sample description",
    is_sample: true,
  };

  it("calculates status correctly based on 72h window", () => {
    expect(getStatus(sampleEvent, now)).toBe("closing-soon");

    // Before reg_start -> upcoming
    const futureEvent = {
      ...sampleEvent,
      reg_start: new Date(now + 24 * HOUR).toISOString(),
      reg_deadline: new Date(now + 100 * HOUR).toISOString(),
    };
    expect(getStatus(futureEvent, now)).toBe("upcoming");

    // Past deadline -> closed
    const pastEvent = {
      ...sampleEvent,
      reg_deadline: new Date(now - 1000).toISOString(),
    };
    expect(getStatus(pastEvent, now)).toBe("closed");
  });

  it("computes countdown days, hours, and minutes", () => {
    const cd = countdown(sampleEvent, now);
    expect(cd.status).toBe("closing-soon");
    expect(cd.days).toBe(2);
  });

  it("filters hackathons by query, mode, and student eligibility", () => {
    const events = [sampleEvent];
    const filtered = filterHackathons(events, { q: "Buildverse", mode: "online" }, now);
    expect(filtered.length).toBe(1);

    const nonMatching = filterHackathons(events, { mode: "offline" }, now);
    expect(nonMatching.length).toBe(0);
  });

  it("groups saved quests into active, upcoming, and past", () => {
    const events = [sampleEvent];
    expect(questTab(sampleEvent, now)).toBe("active");

    const groups = questGroups(events, ["test-1"], "active", now);
    expect(groups.length).toBe(2); // Closing soon and Open
    expect(groups[0].title).toBe("Closing soon");
    expect(groups[0].events.length).toBe(1);
  });
});
