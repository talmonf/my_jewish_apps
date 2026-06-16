import type { TehillimToken, TehillimTokenRole } from "@/db/schema";

import { splitHebrewWords, stripTeamim } from "./text";

type Span = { start: number; end: number; role: TehillimTokenRole };

const kamatzKatanExamples = ["כָּל", "חָכְמָה", "קָדְשׁ"];

const NIKKUD_PATTERN = /[\u0591-\u05C7]/g;

function normalized(word: string) {
  return stripTeamim(word).replace(NIKKUD_PATTERN, "");
}

function findAuthorSpans(words: string[]) {
  const spans: Span[] = [];

  for (let index = 0; index < words.length; index += 1) {
    const word = normalized(words[index]);

    if (
      word.startsWith("לדוד") ||
      word.startsWith("לאסף") ||
      word.startsWith("למשה") ||
      word.startsWith("לשלמה") ||
      word.startsWith("למיכם") ||
      word.startsWith("לעזרא") ||
      word.startsWith("להימן") ||
      word.startsWith("לאיתן") ||
      word.startsWith("לבני")
    ) {
      spans.push({ start: index, end: index, role: "author" });

      if (word.startsWith("לבני") && index + 1 < words.length) {
        spans.push({ start: index, end: index + 1, role: "author" });
      }
    }
  }

  return spans;
}

function findInstrumentSpans(words: string[]) {
  const spans: Span[] = [];

  for (let index = 0; index < words.length; index += 1) {
    const word = normalized(words[index]);
    const next = index + 1 < words.length ? normalized(words[index + 1]) : "";

    if (word === "בנגינות") {
      spans.push({ start: index, end: index, role: "instrument" });
    }

    if (word === "על" && /גתית|שושנ|מחלת|שמינית|עלמות/.test(next)) {
      spans.push({ start: index, end: index + 1, role: "instrument" });
    }
  }

  return spans;
}

function roleForIndex(index: number, spans: Span[]) {
  const span = spans.find((entry) => index >= entry.start && index <= entry.end);
  return span?.role ?? "normal";
}

export function annotateSuperscriptionTokens(
  hebrew: string,
  verse: number,
): TehillimToken[] {
  const words = splitHebrewWords(hebrew);

  if (verse !== 1) {
    return words.map((text) => ({
      text,
      kamatzKatan: kamatzKatanExamples.some((example) => text.includes(example)),
      role: "normal" as const,
    }));
  }

  const spans = [...findAuthorSpans(words), ...findInstrumentSpans(words)];

  return words.map((text, index) => ({
    text,
    kamatzKatan: kamatzKatanExamples.some((example) => text.includes(example)),
    role: roleForIndex(index, spans),
  }));
}

export function parseSuperscriptionAuthor(hebrew: string, verse: number) {
  if (verse !== 1) {
    return null;
  }

  const tokens = annotateSuperscriptionTokens(hebrew, verse);
  const authorWords = tokens.filter((token) => token.role === "author");

  return authorWords.length > 0 ? authorWords.map((token) => token.text).join(" ") : null;
}
