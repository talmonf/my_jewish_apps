import { describe, expect, it } from "vitest";

import { analyzeLeiningSubmission } from "./analyzer";

describe("analyzeLeiningSubmission", () => {
  it("returns a placeholder timing issue when no transcript is available", async () => {
    const result = await analyzeLeiningSubmission({
      expectedText: "בראשית ברא",
      studentAudioUrl: "https://example.com/student.mp3",
    });

    expect(result.provider).toBe("internal-placeholder");
    expect(result.issues[0]?.type).toBe("timing");
  });

  it("flags expected words missing from a supplied transcript", async () => {
    const result = await analyzeLeiningSubmission({
      expectedText: "בראשית ברא אלהים",
      studentAudioUrl: "https://example.com/student.mp3",
      transcript: "בראשית אלהים",
    });

    expect(result.issues).toContainEqual(
      expect.objectContaining({ type: "missed_word", expected: "ברא" }),
    );
  });
});
