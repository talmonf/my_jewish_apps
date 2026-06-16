import { describe, expect, it } from "vitest";

import { annotateSuperscriptionTokens } from "./superscription";

describe("annotateSuperscriptionTokens", () => {
  it("marks davidic superscriptions as author", () => {
    const tokens = annotateSuperscriptionTokens("מִזְמוֹר לְדָוִד", 1);
    expect(tokens.some((token) => token.role === "author")).toBe(true);
  });

  it("does not mark author on non-superscription verses", () => {
    const tokens = annotateSuperscriptionTokens("אַשְׁרֵי הָאִישׁ", 2);
    expect(tokens.every((token) => token.role === "normal")).toBe(true);
  });

  it("marks instruments in superscriptions", () => {
    const tokens = annotateSuperscriptionTokens("לַמְנַצֵּחַ עַל הַגִּתִּית", 1);
    expect(tokens.some((token) => token.role === "instrument")).toBe(true);
  });
});
