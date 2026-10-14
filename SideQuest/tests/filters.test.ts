import { describe, it, expect } from "vitest";
import { parseSearchParamsToFilters, filtersToQueryString } from "@/lib/filters";

describe("lib/filters.ts", () => {
  it("parses query params into structured filters", () => {
    const params = {
      q: "agent",
      mode: "online",
      city: "Bengaluru",
      status: "closing_soon",
      tags: "ai,web3",
      prize_min: "250000",
      include_closed: "true",
      sort: "prize_high",
      page: "2",
    };

    const parsed = parseSearchParamsToFilters(params);
    expect(parsed.q).toBe("agent");
    expect(parsed.mode).toBe("online");
    expect(parsed.city).toBe("Bengaluru");
    expect(parsed.status).toBe("closing_soon");
    expect(parsed.tags).toEqual(["ai", "web3"]);
    expect(parsed.prize_min).toBe(250000);
    expect(parsed.include_closed).toBe(true);
    expect(parsed.sort).toBe("prize_high");
    expect(parsed.page).toBe(2);
  });

  it("serializes filters back to query string idempotently", () => {
    const filters = {
      q: "hackathon",
      mode: "offline" as const,
      tags: ["iot", "robotics"],
      prize_min: 100000,
    };

    const qs = filtersToQueryString(filters);
    expect(qs).toContain("q=hackathon");
    expect(qs).toContain("mode=offline");
    expect(qs).toContain("tags=iot%2Crobotics");
    expect(qs).toContain("prize_min=100000");
  });
});
