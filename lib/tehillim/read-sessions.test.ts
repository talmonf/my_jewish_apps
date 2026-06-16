import { describe, expect, it } from "vitest";

import { buildReadSessionLabel } from "./read-sessions";

describe("buildReadSessionLabel", () => {
  it("builds Hebrew labels for common report types", () => {
    expect(buildReadSessionLabel("single", { chapter: 1 })).toBe("פרק א");
    expect(buildReadSessionLabel("range", { startChapter: 3, endChapter: 10 })).toBe(
      "פרקים ג–י",
    );
    expect(buildReadSessionLabel("book", { book: 3 })).toBe("ספר 3");
    expect(buildReadSessionLabel("month", { monthDayStart: 1, monthDayEnd: 2 })).toBe(
      "ימים 1–2",
    );
  });
});
