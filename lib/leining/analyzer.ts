import type { LeiningIssue } from "@/db/schema";

export type LeiningAnalysisInput = {
  expectedText: string;
  referenceAudioUrl?: string;
  studentAudioUrl: string;
  transcript?: string;
};

export type LeiningAnalysisOutput = {
  provider: string;
  confidence: number;
  issues: LeiningIssue[];
};

export async function analyzeLeiningSubmission(
  input: LeiningAnalysisInput,
): Promise<LeiningAnalysisOutput> {
  if (!process.env.AI_PROVIDER_API_KEY) {
    return placeholderAnalysis(input);
  }

  // A future provider implementation belongs behind this boundary.
  return placeholderAnalysis(input);
}

function placeholderAnalysis(input: LeiningAnalysisInput): LeiningAnalysisOutput {
  const expectedWords = normalizeWords(input.expectedText);
  const actualWords = normalizeWords(input.transcript ?? "");
  const issues: LeiningIssue[] = [];

  if (actualWords.length === 0) {
    issues.push({
      type: "timing",
      expected: expectedWords.slice(0, 6).join(" "),
      confidence: 40,
      note: "Audio was uploaded, but no transcript is available yet.",
    });
  }

  for (const word of expectedWords) {
    if (actualWords.length > 0 && !actualWords.includes(word)) {
      issues.push({
        type: "missed_word",
        expected: word,
        confidence: 55,
        note: "Expected word was not found in the supplied transcript.",
      });
    }
  }

  return {
    provider: "internal-placeholder",
    confidence: issues.length === 0 ? 75 : 45,
    issues: issues.slice(0, 12),
  };
}

function normalizeWords(text: string) {
  return text
    .replace(/[^\p{Letter}\p{Mark}\s]/gu, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean);
}
