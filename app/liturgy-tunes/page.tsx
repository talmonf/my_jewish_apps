import Link from "next/link";
import { asc, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  liturgyTunesLinks,
  liturgyTunesParts,
  liturgyTunesSearchRequests,
  liturgyTunesSearchResults,
  liturgyTunesTuneParts,
  liturgyTunesTunes,
} from "@/db/schema";
import { requireAppAccess } from "@/lib/access";

import { submitTuneSearch } from "./actions";
import { RecordingPanel } from "./RecordingPanel";

type PageProps = {
  searchParams?: Promise<{
    part?: string;
    tab?: string;
    request?: string;
  }>;
};

function groupPartsByService(parts: Array<typeof liturgyTunesParts.$inferSelect>) {
  const byService = new Map<string, typeof parts>();
  for (const part of parts) {
    const current = byService.get(part.service) ?? [];
    current.push(part);
    byService.set(part.service, current);
  }
  return byService;
}

export default async function LiturgyTunesPage({ searchParams }: PageProps) {
  const user = await requireAppAccess("liturgy-tunes");
  const params = await searchParams;
  const activeTab = params?.tab === "find" ? "find" : "browse";
  const selectedPartId = params?.part;
  const selectedRequestId = params?.request;

  const [parts, tunes, tuneParts, links, searchRequests, searchResults] =
    await Promise.all([
      db
        .select()
        .from(liturgyTunesParts)
        .orderBy(asc(liturgyTunesParts.sortOrder), asc(liturgyTunesParts.nameEn)),
      db.select().from(liturgyTunesTunes).orderBy(asc(liturgyTunesTunes.name)),
      db.select().from(liturgyTunesTuneParts),
      db
        .select()
        .from(liturgyTunesLinks)
        .orderBy(asc(liturgyTunesLinks.sortOrder)),
      db
        .select()
        .from(liturgyTunesSearchRequests)
        .where(eq(liturgyTunesSearchRequests.userId, user.id))
        .orderBy(desc(liturgyTunesSearchRequests.createdAt))
        .limit(10),
      db.select().from(liturgyTunesSearchResults),
    ]);

  const partsByService = groupPartsByService(parts);
  const tuneIdsForPart = new Set(
    tuneParts
      .filter((entry) => entry.partId === selectedPartId)
      .map((entry) => entry.tuneId),
  );
  const selectedTunes = selectedPartId
    ? tunes.filter((tune) => tuneIdsForPart.has(tune.id))
    : [];

  const linksByTune = new Map<string, typeof links>();
  for (const link of links) {
    const current = linksByTune.get(link.tuneId) ?? [];
    current.push(link);
    linksByTune.set(link.tuneId, current);
  }

  const resultsByRequest = new Map(
    searchResults.map((result) => [result.requestId, result]),
  );

  const selectedRequest = selectedRequestId
    ? searchRequests.find((request) => request.id === selectedRequestId)
    : searchRequests[0];
  const selectedResults = selectedRequest
    ? resultsByRequest.get(selectedRequest.id)
    : undefined;

  const selectedPart = selectedPartId
    ? parts.find((part) => part.id === selectedPartId)
    : undefined;

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-8">
      <Link href="/" className="text-sm font-medium text-sky-700">
        Back to apps
      </Link>
      <header className="mt-2">
        <h1 className="text-3xl font-bold">Liturgy Tunes</h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          Browse curated tunes for each part of the liturgy, or search the web
          using liturgy words and a recording.
        </p>
      </header>

      <nav className="mt-6 flex gap-2">
        <Link
          href="/liturgy-tunes?tab=browse"
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            activeTab === "browse"
              ? "bg-sky-700 text-white"
              : "bg-white text-slate-700 ring-1 ring-slate-200"
          }`}
        >
          Browse catalog
        </Link>
        <Link
          href="/liturgy-tunes?tab=find"
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            activeTab === "find"
              ? "bg-sky-700 text-white"
              : "bg-white text-slate-700 ring-1 ring-slate-200"
          }`}
        >
          Find the tune
        </Link>
      </nav>

      {activeTab === "browse" ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold">Liturgy parts</h2>
            <div className="mt-4 space-y-4">
              {[...partsByService.entries()].map(([service, serviceParts]) => (
                <div key={service}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {service}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {serviceParts.map((part) => (
                      <li key={part.id}>
                        <Link
                          href={`/liturgy-tunes?tab=browse&part=${part.id}`}
                          className={`block rounded-lg px-3 py-2 text-sm ${
                            selectedPartId === part.id
                              ? "bg-sky-50 font-medium text-sky-800"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <span>{part.nameEn}</span>
                          <span className="hebrew-text mt-0.5 block text-slate-500">
                            {part.nameHe}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </aside>

          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            {selectedPart ? (
              <>
                <h2 className="text-2xl font-semibold">{selectedPart.nameEn}</h2>
                <p className="hebrew-text mt-1 text-lg text-slate-700">
                  {selectedPart.nameHe}
                </p>
                <p className="mt-1 text-sm text-slate-500">{selectedPart.service}</p>

                {selectedTunes.length === 0 ? (
                  <p className="mt-6 text-slate-600">
                    No tunes linked to this part yet.
                  </p>
                ) : (
                  <div className="mt-6 space-y-4">
                    {selectedTunes.map((tune) => {
                      const tuneLinks = linksByTune.get(tune.id) ?? [];
                      return (
                        <article
                          key={tune.id}
                          className="rounded-xl border border-slate-200 p-4"
                        >
                          <h3 className="text-lg font-semibold">{tune.name}</h3>
                          {tune.tradition ? (
                            <p className="text-sm text-slate-500">{tune.tradition}</p>
                          ) : null}
                          {tune.description ? (
                            <p className="mt-2 text-sm text-slate-600">
                              {tune.description}
                            </p>
                          ) : null}
                          {tuneLinks.length > 0 ? (
                            <ul className="mt-3 space-y-2">
                              {tuneLinks.map((link) => (
                                <li key={link.id}>
                                  <a
                                    href={link.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm font-medium text-sky-700 hover:underline"
                                  >
                                    {link.label || link.url}
                                  </a>
                                  <span className="ml-2 text-xs text-slate-500">
                                    {link.linkType}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="mt-3 text-sm text-slate-500">No links yet.</p>
                          )}
                        </article>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <p className="text-slate-600">
                Select a liturgy part from the sidebar to browse tunes.
              </p>
            )}
          </section>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold">Find the tune online</h2>
            <p className="mt-2 text-sm text-slate-600">
              Enter the liturgy words and optionally add a recording. The app will
              search YouTube and the web for matching melodies.
            </p>

            <form action={submitTuneSearch} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="liturgyText"
                  className="text-sm font-medium text-slate-700"
                >
                  Liturgy text
                </label>
                <textarea
                  id="liturgyText"
                  name="liturgyText"
                  required
                  rows={4}
                  placeholder="Enter the opening words or section text"
                  className="hebrew-text mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="partId"
                    className="text-sm font-medium text-slate-700"
                  >
                    Liturgy part (optional)
                  </label>
                  <select
                    id="partId"
                    name="partId"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                    defaultValue=""
                  >
                    <option value="">No specific part</option>
                    {parts.map((part) => (
                      <option key={part.id} value={part.id}>
                        {part.nameEn} ({part.nameHe})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="tradition"
                    className="text-sm font-medium text-slate-700"
                  >
                    Tradition (optional)
                  </label>
                  <input
                    id="tradition"
                    name="tradition"
                    placeholder="ashkenaz, sefard, etc."
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
              </div>

              <RecordingPanel />

              <button
                type="submit"
                className="rounded-lg bg-sky-700 px-4 py-2 font-medium text-white"
              >
                Search the web
              </button>
            </form>
          </section>

          <aside className="space-y-4">
            <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <h3 className="font-semibold">Recent searches</h3>
              {searchRequests.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">No searches yet.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {searchRequests.map((request) => (
                    <li key={request.id}>
                      <Link
                        href={`/liturgy-tunes?tab=find&request=${request.id}`}
                        className={`block rounded-lg px-3 py-2 text-sm ${
                          selectedRequest?.id === request.id
                            ? "bg-sky-50 text-sky-800"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span className="hebrew-text line-clamp-2">
                          {request.liturgyText}
                        </span>
                        <span className="mt-1 block text-xs text-slate-500">
                          {request.status}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {selectedRequest && selectedResults ? (
              <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                <h3 className="font-semibold">Results</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Provider: {selectedResults.provider}
                </p>
                {selectedRequest.transcript ? (
                  <p className="hebrew-text mt-2 text-sm text-slate-600">
                    Transcript: {selectedRequest.transcript}
                  </p>
                ) : null}
                <ul className="mt-4 space-y-3">
                  {selectedResults.results.map((result, index) => (
                    <li
                      key={`${result.url}-${index}`}
                      className="rounded-lg border border-slate-200 p-3"
                    >
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-sky-700 hover:underline"
                      >
                        {result.title}
                      </a>
                      <p className="mt-1 text-xs uppercase text-slate-500">
                        {result.source}
                        {result.relevanceScore
                          ? ` · score ${result.relevanceScore}`
                          : ""}
                      </p>
                      {result.snippet ? (
                        <p className="mt-1 line-clamp-3 text-sm text-slate-600">
                          {result.snippet}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </aside>
        </div>
      )}
    </main>
  );
}
