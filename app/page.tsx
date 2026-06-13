import Link from "next/link";

import { SignOutButton } from "@/components/SignOutButton";
import { listAccessibleApps, requireUser } from "@/lib/access";

export default async function Home() {
  const user = await requireUser();
  const accessibleApps = await listAccessibleApps(user.id);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-8">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
            Jewish Apps
          </p>
          <h1 className="text-3xl font-bold">Shalom, {user.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          {user.role === "admin" ? (
            <Link
              href="/admin"
              className="rounded-lg bg-slate-950 px-3 py-1.5 text-sm font-medium text-white"
            >
              Admin
            </Link>
          ) : null}
          <SignOutButton />
        </div>
      </header>

      <section>
        <h2 className="text-xl font-semibold">Your apps</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {accessibleApps.map((app) => (
            <Link
              key={app.key}
              href={app.href}
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="text-sm font-medium capitalize text-sky-700">
                {app.accessLevel}
              </p>
              <h3 className="mt-2 text-2xl font-bold">{app.name}</h3>
              <p className="mt-2 text-slate-600">{app.description}</p>
            </Link>
          ))}
        </div>
        {accessibleApps.length === 0 ? (
          <p className="mt-4 rounded-xl bg-white p-6 text-slate-600 ring-1 ring-slate-200">
            You do not have access to any apps yet. Ask an admin to enable one.
          </p>
        ) : null}
      </section>
    </main>
  );
}
