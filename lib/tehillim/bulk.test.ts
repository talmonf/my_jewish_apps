import { describe, expect, it } from "vitest";

import { getBulkReadChapters } from "./bulk";

describe("getBulkReadChapters", () => {
  it("selects an inclusive chapter range in either order", () => {
    expect(getBulkReadChapters("range", 5, 3)).toEqual([3, 4, 5]);
  });

  it("selects weekday divisions", () => {
    expect(getBulkReadChapters("weekday", 1, 1)).toContain(29);
    expect(getBulkReadChapters("weekday", 1, 1)).not.toContain(30);
  });

  it("selects day-of-month divisions", () => {
    expect(getBulkReadChapters("month", 30, 30)).toContain(150);
    expect(getBulkReadChapters("month", 30, 30)).not.toContain(1);
  });

  it("selects inclusive month day ranges", () => {
    const chapters = getBulkReadChapters("month", 1, 2);
    expect(chapters).toContain(9);
    expect(chapters).toContain(17);
  });

  it("selects all chapters in a book", () => {
    expect(getBulkReadChapters("book", 3, 3)).toEqual(
      expect.arrayContaining([73, 89]),
    );
    expect(getBulkReadChapters("book", 3, 3)).not.toContain(72);
    expect(getBulkReadChapters("book", 3, 3)).not.toContain(90);
  });
});
