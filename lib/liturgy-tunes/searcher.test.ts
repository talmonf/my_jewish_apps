import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { searchInternetForTune } from "./searcher";

describe("searchInternetForTune", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
    delete process.env.YOUTUBE_API_KEY;
    delete process.env.GOOGLE_CSE_API_KEY;
    delete process.env.GOOGLE_CSE_ID;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns example YouTube links when no search APIs are configured", async () => {
    const output = await searchInternetForTune({
      liturgyText: "נקדישך ונעריצך",
      partNameEn: "Kedusha",
    });

    expect(output.provider).toBe("example-links");
    expect(output.results).toHaveLength(1);
    expect(output.results[0]?.url).toContain("youtube.com/results");
    expect(output.message).toContain("YOUTUBE_API_KEY");
  });

  it("deduplicates and ranks merged provider results", async () => {
    process.env.YOUTUBE_API_KEY = "test-key";

    const fetchMock = vi.fn(async (url: string | URL) => {
      const target = String(url);
      if (target.includes("youtube")) {
        return new Response(
          JSON.stringify({
            items: [
              {
                id: { videoId: "abc123" },
                snippet: {
                  title: "Kedusha nusach ashkenaz",
                  description: "נקדישך ונעריצך",
                },
              },
              {
                id: { videoId: "abc123" },
                snippet: {
                  title: "Duplicate entry",
                  description: "should be removed",
                },
              },
            ],
          }),
          { status: 200 },
        );
      }

      return new Response("{}", { status: 404 });
    });

    vi.stubGlobal("fetch", fetchMock);

    const output = await searchInternetForTune({
      liturgyText: "נקדישך ונעריצך",
      partNameEn: "Kedusha",
    });

    expect(output.provider).toBe("youtube");
    expect(output.results).toHaveLength(1);
    expect(output.results[0]?.title).toContain("Kedusha");
    expect(output.results[0]?.relevanceScore).toBeGreaterThan(2);
  });
});
