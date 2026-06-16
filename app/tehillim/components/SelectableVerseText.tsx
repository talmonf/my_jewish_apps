"use client";

import { useCallback, useRef, useState, useTransition } from "react";

import type { TehillimToken } from "@/db/schema";
import { stripTeamim } from "@/lib/tehillim/text";

import {
  addWordHighlight,
  removeHighlightsByIds,
  togglePhraseBreak,
} from "../actions";

type Highlight = {
  id: string;
  startVerse: number;
  endVerse: number;
  startWord: number | null;
  endWord: number | null;
};

type PhraseBreak = {
  afterWordIndex: number;
  breakType: string;
};

type SelectableVerseTextProps = {
  chapter: number;
  verse: number;
  tokens: TehillimToken[];
  highlights: Highlight[];
  phraseBreaks: PhraseBreak[];
  showKamatzKatan: boolean;
  showTeamim: boolean;
  fontClass: string;
  fontSize: number;
};

type MenuState = {
  x: number;
  y: number;
  startWord: number;
  endWord: number;
  overlappingIds: string[];
  existingBreak: PhraseBreak | null;
};

function wordIsHighlighted(
  wordIndex: number,
  verse: number,
  highlights: Highlight[],
) {
  return highlights.some((highlight) => {
    if (verse < highlight.startVerse || verse > highlight.endVerse) {
      return false;
    }

    if (highlight.startWord === null || highlight.endWord === null) {
      return true;
    }

    if (verse === highlight.startVerse && verse === highlight.endVerse) {
      return wordIndex >= highlight.startWord && wordIndex <= highlight.endWord;
    }

    if (verse === highlight.startVerse) {
      return wordIndex >= highlight.startWord;
    }

    if (verse === highlight.endVerse) {
      return wordIndex <= highlight.endWord;
    }

    return verse > highlight.startVerse && verse < highlight.endVerse;
  });
}

export function SelectableVerseText({
  chapter,
  verse,
  tokens,
  highlights,
  phraseBreaks,
  showKamatzKatan,
  showTeamim,
  fontClass,
  fontSize,
}: SelectableVerseTextProps) {
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(
    null,
  );
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [pending, startTransition] = useTransition();
  const longPressTimer = useRef<number | null>(null);
  const anchorRef = useRef<number | null>(null);

  const verseHighlights = highlights.filter(
    (highlight) => verse >= highlight.startVerse && verse <= highlight.endVerse,
  );

  const finishSelection = useCallback(
    (start: number, end: number, x: number, y: number) => {
      const low = Math.min(start, end);
      const high = Math.max(start, end);
      const overlappingIds = verseHighlights
        .filter((highlight) => {
          if (highlight.startWord === null || highlight.endWord === null) {
            return true;
          }

          return !(high < highlight.startWord || low > highlight.endWord);
        })
        .map((highlight) => highlight.id);

      const existingBreak =
        phraseBreaks.find((entry) => entry.afterWordIndex === high) ?? null;

      setSelection({ start: low, end: high });
      setMenu({ x, y, startWord: low, endWord: high, overlappingIds, existingBreak });
      setIsSelecting(false);
    },
    [phraseBreaks, verseHighlights],
  );

  function clearLongPress() {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }

  function handleWordPointerDown(
    index: number,
    event: React.PointerEvent<HTMLSpanElement>,
  ) {
    clearLongPress();
    anchorRef.current = index;
    setIsSelecting(true);
    setMenu(null);
    setSelection({ start: index, end: index });

    if (event.pointerType === "touch") {
      longPressTimer.current = window.setTimeout(() => {
        finishSelection(index, index, event.clientX, event.clientY);
      }, 450);
    }
  }

  function handleWordPointerEnter(index: number, event: React.PointerEvent<HTMLSpanElement>) {
    if (!isSelecting || anchorRef.current === null) {
      return;
    }

    clearLongPress();
    setSelection({
      start: Math.min(anchorRef.current, index),
      end: Math.max(anchorRef.current, index),
    });
  }

  function handlePointerUp(event: React.PointerEvent<HTMLParagraphElement>) {
    clearLongPress();

    if (!isSelecting || anchorRef.current === null || !selection) {
      setIsSelecting(false);
      return;
    }

    finishSelection(selection.start, selection.end, event.clientX, event.clientY);
  }

  function handleHighlight() {
    if (!menu) {
      return;
    }

    const isFullVerse =
      menu.startWord === 0 && menu.endWord === tokens.length - 1;

    startTransition(async () => {
      await addWordHighlight({
        chapter,
        startVerse: verse,
        endVerse: verse,
        startWord: isFullVerse ? undefined : menu.startWord,
        endWord: isFullVerse ? undefined : menu.endWord,
      });
      setMenu(null);
      setSelection(null);
    });
  }

  function handleRemoveHighlight() {
    if (!menu) {
      return;
    }

    startTransition(async () => {
      await removeHighlightsByIds(menu.overlappingIds);
      setMenu(null);
      setSelection(null);
    });
  }

  function handlePhraseBreak(breakType: "newline" | "tab") {
    if (!menu) {
      return;
    }

    startTransition(async () => {
      await togglePhraseBreak({
        chapter,
        verse,
        afterWordIndex: menu.endWord,
        breakType,
      });
      setMenu(null);
      setSelection(null);
    });
  }

  return (
    <div className="relative">
      <p
        className={`${fontClass} text-right leading-relaxed`}
        style={{ fontSize: `${(fontSize / 100) * 1.75}rem` }}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => {
          if (isSelecting) {
            clearLongPress();
          }
        }}
      >
        {tokens.map((token, index) => {
          const displayText = showTeamim ? token.text : stripTeamim(token.text);
          const selected =
            selection &&
            index >= selection.start &&
            index <= selection.end;
          const highlighted = wordIsHighlighted(index, verse, highlights);
          const roleClass =
            token.role === "author"
              ? "tehillim-author"
              : token.role === "instrument"
                ? "tehillim-instrument"
                : "";
          const kamatzClass =
            showKamatzKatan && token.kamatzKatan ? "tehillim-kamatz-katan" : "";
          const phraseBreak = phraseBreaks.find(
            (entry) => entry.afterWordIndex === index,
          );

          return (
            <span key={`${verse}-${index}`}>
              <span
                data-word-index={index}
                onPointerDown={(event) => handleWordPointerDown(index, event)}
                onPointerEnter={(event) => handleWordPointerEnter(index, event)}
                className={[
                  "cursor-pointer rounded px-0.5",
                  roleClass,
                  kamatzClass,
                  highlighted || selected ? "tehillim-word-highlight" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {displayText}
              </span>
              {phraseBreak?.breakType === "newline" ? <br /> : null}
              {phraseBreak?.breakType === "tab" ? (
                <span className="tehillim-phrase-tab" />
              ) : null}
              {index < tokens.length - 1 && !phraseBreak ? " " : null}
            </span>
          );
        })}
      </p>

      {menu ? (
        <div
          className="fixed z-50 min-w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-xl"
          style={{ left: menu.x, top: menu.y }}
        >
          <button
            type="button"
            disabled={pending}
            onClick={handleHighlight}
            className="block w-full px-4 py-2 text-right text-sm hover:bg-slate-100"
          >
            הדגש
          </button>
          {menu.overlappingIds.length > 0 ? (
            <button
              type="button"
              disabled={pending}
              onClick={handleRemoveHighlight}
              className="block w-full px-4 py-2 text-right text-sm hover:bg-slate-100"
            >
              הסר הדגשה
            </button>
          ) : null}
          <button
            type="button"
            disabled={pending}
            onClick={() => handlePhraseBreak("newline")}
            className="block w-full px-4 py-2 text-right text-sm hover:bg-slate-100"
          >
            {menu.existingBreak?.breakType === "newline" ? "הסר שורה חדשה" : "שורה חדשה"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => handlePhraseBreak("tab")}
            className="block w-full px-4 py-2 text-right text-sm hover:bg-slate-100"
          >
            {menu.existingBreak?.breakType === "tab" ? "הסר טאב" : "טאב"}
          </button>
          <button
            type="button"
            onClick={() => {
              setMenu(null);
              setSelection(null);
            }}
            className="block w-full px-4 py-2 text-right text-sm text-slate-500 hover:bg-slate-100"
          >
            ביטול
          </button>
        </div>
      ) : null}
    </div>
  );
}
