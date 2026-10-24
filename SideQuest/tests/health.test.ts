import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/health/route";

describe("Health API Route", () => {
  it("returns 200 with status ok and valid json", async () => {
    const res = await GET(new Request("https://sidequest.camp/api/health") as any);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.status).toBe("ok");
    expect(json.app).toBe("BuildSeek");
    expect(json.timestamp).toBeDefined();
    expect(json.supabase).toBeDefined();
  });
});
