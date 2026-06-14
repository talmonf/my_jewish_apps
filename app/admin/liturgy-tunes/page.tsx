import Link from "next/link";

import { requireAdmin } from "@/lib/access";

import {
  createLiturgyLink,
  createLiturgyPart,
  createLiturgyTune,
  deleteLiturgyLink,
  deleteLiturgyPart,
  deleteLiturgyTune,
  listLiturgyAdminData,
  updateTuneParts,
} from "./actions";

const services = [
  "shacharit",
  "mincha",
  "maariv",
  "musaf",
  "holiday",
  "other",
];

const linkTypes = ["youtube", "website", "audio", "sheet_music"] as const;

export default async function LiturgyTunesAdminPage() {
  await requireAdmin();
  const { parts, tunes, partsByTune, linksByTune } = await listLiturgyAdminData();

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-8">
      <header className="mb-8">
        <Link href="/admin" className="text-sm font-medium text-sky-700">
          Back to admin
        </Link>
        <h1 className="mt-2 text-3xl font-bold">Manage Liturgy Tunes</h1>
        <p className="mt-1 text-slate-600">
          Curate liturgy parts, tunes, and external links for the browse catalog.
        </p>
      </header>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-semibold">Add liturgy part</h2>
        <form action={createLiturgyPart} className="mt-4 grid gap-3 md:grid-cols-3">
          <input
            name="nameEn"
            placeholder="English name"
            required
            className="rounded-lg border border-slate-300 px-3 py-2"
          />
          <input
            name="nameHe"
            placeholder="Hebrew name"
            required
            className="hebrew-text rounded-lg border border-slate-300 px-3 py-2"
          />
          <select
            name="service"
            required
            className="rounded-lg border border-slate-300 px-3 py-2"
          >
            {services.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>
          <select
            name="parentId"
            className="rounded-lg border border-slate-300 px-3 py-2 md:col-span-2"
          >
            <option value="">No parent (top level)</option>
            {parts.map((part) => (
              <option key={part.id} value={part.id}>
                {part.nameEn} ({part.service})
              </option>
            ))}
          </select>
          <input
            name="sortOrder"
            type="number"
            defaultValue={0}
            className="rounded-lg border border-slate-300 px-3 py-2"
          />
          <button
            type="submit"
            className="rounded-lg bg-sky-700 px-4 py-2 font-medium text-white md:col-span-3 md:justify-self-start"
          >
            Add part
          </button>
        </form>

        <div className="mt-6 divide-y divide-slate-100">
          {parts.map((part) => (
            <div key={part.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">
                  {part.nameEn}{" "}
                  <span className="hebrew-text text-slate-600">({part.nameHe})</span>
                </p>
                <p className="text-sm text-slate-500">
                  {part.service}
                  {part.parentId ? " · child part" : " · top level"}
                </p>
              </div>
              <form action={deleteLiturgyPart}>
                <input type="hidden" name="id" value={part.id} />
                <button
                  type="submit"
                  className="text-sm font-medium text-rose-700 hover:text-rose-800"
                >
                  Delete
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-semibold">Add tune</h2>
        <form action={createLiturgyTune} className="mt-4 grid gap-3">
          <div className="grid gap-3 md:grid-cols-2">
            <input
              name="name"
              placeholder="Tune name"
              required
              className="rounded-lg border border-slate-300 px-3 py-2"
            />
            <input
              name="tradition"
              placeholder="Tradition (ashkenaz, sefard, etc.)"
              className="rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
          <textarea
            name="description"
            placeholder="Description"
            rows={2}
            className="rounded-lg border border-slate-300 px-3 py-2"
          />
          <fieldset className="rounded-lg border border-slate-200 p-3">
            <legend className="px-1 text-sm font-medium text-slate-700">
              Linked liturgy parts
            </legend>
            <div className="mt-2 grid gap-2 md:grid-cols-2">
              {parts.map((part) => (
                <label key={part.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="partIds" value={part.id} />
                  <span>
                    {part.nameEn}{" "}
                    <span className="hebrew-text text-slate-500">({part.nameHe})</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <button
            type="submit"
            className="justify-self-start rounded-lg bg-sky-700 px-4 py-2 font-medium text-white"
          >
            Add tune
          </button>
        </form>
      </section>

      <section className="mt-6 space-y-4">
        {tunes.map((tune) => {
          const linkedPartIds = partsByTune.get(tune.id) ?? [];
          const tuneLinks = linksByTune.get(tune.id) ?? [];

          return (
            <article
              key={tune.id}
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">{tune.name}</h3>
                  {tune.tradition ? (
                    <p className="text-sm text-slate-500">{tune.tradition}</p>
                  ) : null}
                  {tune.description ? (
                    <p className="mt-1 text-sm text-slate-600">{tune.description}</p>
                  ) : null}
                </div>
                <form action={deleteLiturgyTune}>
                  <input type="hidden" name="id" value={tune.id} />
                  <button
                    type="submit"
                    className="text-sm font-medium text-rose-700 hover:text-rose-800"
                  >
                    Delete tune
                  </button>
                </form>
              </div>

              <form action={updateTuneParts} className="mt-4 rounded-lg border border-slate-200 p-3">
                <input type="hidden" name="tuneId" value={tune.id} />
                <p className="text-sm font-medium text-slate-700">Linked parts</p>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  {parts.map((part) => (
                    <label key={part.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        name="partIds"
                        value={part.id}
                        defaultChecked={linkedPartIds.includes(part.id)}
                      />
                      <span>{part.nameEn}</span>
                    </label>
                  ))}
                </div>
                <button
                  type="submit"
                  className="mt-3 text-sm font-medium text-sky-700 hover:text-sky-800"
                >
                  Update linked parts
                </button>
              </form>

              <div className="mt-4">
                <h4 className="font-medium">Links</h4>
                <ul className="mt-2 space-y-2">
                  {tuneLinks.map((link) => (
                    <li
                      key={link.id}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <div>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-sky-700 hover:underline"
                        >
                          {link.label || link.url}
                        </a>
                        <span className="ml-2 text-slate-500">({link.linkType})</span>
                      </div>
                      <form action={deleteLiturgyLink}>
                        <input type="hidden" name="id" value={link.id} />
                        <button
                          type="submit"
                          className="text-rose-700 hover:text-rose-800"
                        >
                          Remove
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              </div>

              <form action={createLiturgyLink} className="mt-4 grid gap-3 md:grid-cols-4">
                <input type="hidden" name="tuneId" value={tune.id} />
                <input
                  name="url"
                  type="url"
                  placeholder="https://..."
                  required
                  className="rounded-lg border border-slate-300 px-3 py-2 md:col-span-2"
                />
                <select
                  name="linkType"
                  required
                  className="rounded-lg border border-slate-300 px-3 py-2"
                >
                  {linkTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <input
                  name="label"
                  placeholder="Label"
                  className="rounded-lg border border-slate-300 px-3 py-2"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white md:col-span-4 md:justify-self-start"
                >
                  Add link
                </button>
              </form>
            </article>
          );
        })}
      </section>
    </main>
  );
}
