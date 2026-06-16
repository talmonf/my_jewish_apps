import { describe, expect, it } from "vitest";

import { toHebrewNumeral } from "./gematria";

describe("toHebrewNumeral", () => {
  it("formats common chapter numbers", () => {
    expect(toHebrewNumeral(1)).toBe("א");
    expect(toHebrewNumeral(23)).toBe("כג");
    expect(toHebrewNumeral(119)).toBe("קיט");
  });
});
