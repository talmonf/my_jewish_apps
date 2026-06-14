import type { ExternalSearchResult } from "@/db/schema";

import {
  buildExampleYouTubeSearchUrl,
  buildSearchQueries,
  type QueryBuilderInput,
} from "./query-builder";
import { searchWeb } from "./web-search";
import { searchYouTube } from "./youtube";

export type SearchInput = QueryBuilderInput & {
  audioUrl?: string;
};

export type SearchOutput = {
  provider: string;
  results: ExternalSearchResult[];
  queries: string[];
  message?: string;
};

function dedupeResults(results: ExternalSearchResult[]) {
  const seen = new Set<string>();
  return results.filter((result) => {
    const key = result.url.toLowerCase();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function scoreResult(result: ExternalSearchResult, queries: string[]) {
  const haystack = `${result.title} ${result.snippet ?? ""}`.toLowerCase();
  let score = result.source === "youtube" ? 2 : 1;

  for (const query of queries) {
    const tokens = query
      .toLowerCase()
      .split(/\s+/)
      .filter((token) => token.length > 2);
    for (const token of tokens) {
      if (haystack.includes(token)) {
        score += 1;
      }
    }
  }

  return { ...result, relevanceScore: score };
}

export async function searchInternetForTune(
  input: SearchInput,
): Promise<SearchOutput> {
  const queries = buildSearchQueries(input);
  const hasYouTube = Boolean(process.env.YOUTUBE_API_KEY);
  const hasWebSearch = Boolean(
    process.env.GOOGLE_CSE_API_KEY && process.env.GOOGLE_CSE_ID,
  );

  if (!hasYouTube && !hasWebSearch) {
    const exampleQuery = queries[0] ?? input.liturgyText;
    return {
      provider: "example-links",
      queries,
      results: [
        {
          title: `Search YouTube for "${exampleQuery}"`,
          url: buildExampleYouTubeSearchUrl(exampleQuery),
          source: "web",
          snippet:
            "Configure YOUTUBE_API_KEY for live results. This link opens a YouTube search.",
          relevanceScore: 1,
        },
      ],
      message:
        "Live search is unavailable. Set YOUTUBE_API_KEY (and optionally GOOGLE_CSE_API_KEY + GOOGLE_CSE_ID).",
    };
  }

  const searchQueries = queries.slice(0, 3);
  const batches = await Promise.all(
    searchQueries.map(async (query) => {
      const [youtubeResults, webResults] = await Promise.all([
        hasYouTube ? searchYouTube(query, 6) : Promise.resolve([]),
        hasWebSearch ? searchWeb(query, 4) : Promise.resolve([]),
      ]);
      return [...youtubeResults, ...webResults];
    }),
  );

  const merged = dedupeResults(batches.flat())
    .map((result) => scoreResult(result, queries))
    .sort((left, right) => (right.relevanceScore ?? 0) - (left.relevanceScore ?? 0))
    .slice(0, 12);

  const providers = [
    hasYouTube ? "youtube" : null,
    hasWebSearch ? "google-cse" : null,
  ].filter(Boolean);

  return {
    provider: providers.join("+") || "none",
    queries,
    results: merged,
  };
}
