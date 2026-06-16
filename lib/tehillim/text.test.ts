import { describe, expect, it } from "vitest";

import { stripTeamim } from "./text";

describe("stripTeamim", () => {
  it("removes cantillation marks while keeping letters", () => {
    const withTeamim = "בָּר֣וּךְ";
    const stripped = stripTeamim(withTeamim);
    expect(stripped).not.toMatch(/[\u0591-\u05AF]/);
    expect(stripped).toContain("ב");
  });
});
