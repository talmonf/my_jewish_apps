import { describe, expect, it } from "vitest";

import {
  buildExampleYouTubeSearchUrl,
  buildSearchQueries,
} from "./query-builder";

describe("buildSearchQueries", () => {
  it("builds Hebrew and context queries from liturgy text", () => {
    const queries = buildSearchQueries({
      liturgyText: "נקדישך ונעריצך",
      partNameEn: "Kedusha",
      tradition: "ashkenaz",
    });

    expect(queries).toContain("נקדישך ונעריצך");
    expect(queries).toContain("נקדישך ונעריצך nusach");
    expect(queries).toContain("נקדישך ונעריצך Kedusha");
    expect(queries).toContain("נקדישך ונעריצך ashkenaz nusach");
  });

  it("adds transcript variants when different from entered text", () => {
    const queries = buildSearchQueries({
      liturgyText: "ברוך אתה",
      transcript: "ברוך אתה ה'",
      partNameEn: "Amidah",
    });

    expect(queries).toContain("ברוך אתה");
    expect(queries).toContain("ברוך אתה ה'");
    expect(queries).toContain("ברוך אתה ה' Amidah nusach");
  });

  it("deduplicates repeated queries", () => {
    const queries = buildSearchQueries({
      liturgyText: "  שמע   ישראל  ",
      partNameEn: "Shema",
    });

    expect(queries.filter((query) => query === "שמע ישראל").length).toBe(1);
  });
});

describe("buildExampleYouTubeSearchUrl", () => {
  it("encodes the query for YouTube search", () => {
    expect(buildExampleYouTubeSearchUrl("קדושה nusach")).toBe(
      "https://www.youtube.com/results?search_query=%D7%A7%D7%93%D7%95%D7%A9%D7%94%20nusach",
    );
  });
});
