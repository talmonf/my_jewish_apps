import { describe, expect, it } from "vitest";

import { APP_CATALOG } from "./app-catalog";

describe("APP_CATALOG", () => {
  it("defines the initial apps with default access", () => {
    expect(APP_CATALOG.map((app) => app.key)).toEqual([
      "tehillim",
      "leining",
      "liturgy-tunes",
    ]);
    expect(APP_CATALOG.every((app) => app.defaultAccessLevel === "viewer")).toBe(
      true,
    );
  });
});
