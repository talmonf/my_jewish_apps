export type QueryBuilderInput = {
  liturgyText: string;
  transcript?: string;
  partNameEn?: string;
  partNameHe?: string;
  tradition?: string;
};

const CONTEXT_SUFFIXES = ["nusach", "melody", "חזנות", "ניגון"];

function normalizeText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function uniqueQueries(queries: string[]) {
  const seen = new Set<string>();
  return queries
    .map((query) => normalizeText(query))
    .filter((query) => {
      if (!query || seen.has(query)) {
        return false;
      }
      seen.add(query);
      return true;
    });
}

export function buildSearchQueries(input: QueryBuilderInput) {
  const liturgyText = normalizeText(input.liturgyText);
  const transcript = input.transcript ? normalizeText(input.transcript) : "";
  const partEn = input.partNameEn?.trim();
  const partHe = input.partNameHe?.trim();
  const tradition = input.tradition?.trim();

  const primary: string[] = [];
  const secondary: string[] = [];

  if (liturgyText) {
    primary.push(liturgyText);
    if (partEn) {
      primary.push(`${liturgyText} ${partEn}`);
      primary.push(`${partEn} ${liturgyText} nusach`);
    }
    if (tradition) {
      primary.push(`${liturgyText} ${tradition} nusach`);
    }
    secondary.push(`${liturgyText} nusach`);
    secondary.push(`${liturgyText} melody`);
    if (partHe) {
      secondary.push(`${liturgyText} ${partHe}`);
    }
  }

  if (transcript && transcript !== liturgyText) {
    primary.push(transcript);
    if (partEn) {
      primary.push(`${transcript} ${partEn} nusach`);
    }
  }

  if (partEn && !liturgyText) {
    for (const suffix of CONTEXT_SUFFIXES) {
      secondary.push(`${partEn} ${suffix}`);
    }
  }

  return uniqueQueries([...primary, ...secondary]).slice(0, 8);
}

export function buildExampleYouTubeSearchUrl(query: string) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}
