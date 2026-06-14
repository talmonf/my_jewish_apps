import Link from "next/link";
import { PasswordInput } from "@/components/PasswordInput";
import { db } from "@/db";
import { apps, defaultAppAccess, userAppAccess, users } from "@/db/schema";
import { requireAdmin } from "@/lib/access";
import { APP_CATALOG } from "@/lib/app-catalog";
import { syncAppsFromCatalog } from "@/lib/sync-apps";

import {
  createUser,
  setAppEnabled,
  setUserAppAccess,
  updateDefaultAppAccess,
  updateUserRole,
} from "./actions";

const roles = ["admin", "teacher", "student", "user"];
const accessLevels = ["viewer", "teacher", "admin"];

export default async function AdminPage() {
  await requireAdmin();
  await syncAppsFromCatalog();

  const [allUsers, appRows, defaultRows, userAccessRows] = await Promise.all([
    db.select().from(users).orderBy(users.email),
    db.select().from(apps).orderBy(apps.name),
    db.select().from(defaultAppAccess),
    db.select().from(userAppAccess),
  ]);

  const defaultAccessByApp = new Map(
    defaultRows.map((entry) => [entry.appKey, entry]),
  );
  const appByKey = new Map(appRows.map((app) => [app.key, app]));
  const userAccess = new Map(
    userAccessRows.map((entry) => [`${entry.userId}:${entry.appKey}`, entry]),
  );

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/" className="text-sm font-medium text-sky-700">
            Back to apps
          </Link>
          <h1 className="mt-2 text-3xl font-bold">Admin Console</h1>
          <p className="mt-1 text-slate-600">
            Manage users, app visibility, and defaults for new registrations.
          </p>
          <Link
            href="/admin/liturgy-tunes"
            className="mt-3 inline-block text-sm font-medium text-sky-700 hover:text-sky-800"
          >
            Manage Liturgy Tunes
          </Link>
        </div>
      </header>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-semibold">Create user</h2>
        <form
          action={createUser}
          autoComplete="off"
          className="mt-4 grid gap-3 md:grid-cols-5"
        >
          <input
            name="name"
            placeholder="Name"
            required
            className="rounded-lg border border-slate-300 px-3 py-2"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            autoComplete="off"
            className="rounded-lg border border-slate-300 px-3 py-2"
          />
          <PasswordInput
            containerClassName="min-w-0"
            name="password"
            minLength={8}
            placeholder="Password"
            required
            autoComplete="new-password"
          />
          <select
            name="role"
            className="rounded-lg border border-slate-300 px-3 py-2"
            defaultValue="user"
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <button className="rounded-lg bg-slate-950 px-4 py-2 font-medium text-white">
            Create
          </button>
        </form>
      </section>

      <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-semibold">Apps and defaults</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {APP_CATALOG.map((definition) => {
            const app = appByKey.get(definition.key);
            const defaultAccess = defaultAccessByApp.get(definition.key);

            return (
              <div
                key={definition.key}
                className="rounded-xl border border-slate-200 p-4"
              >
                <h3 className="font-semibold">{definition.name}</h3>
                <p className="mt-1 text-sm text-slate-600">
                  {definition.description}
                </p>
                <form action={setAppEnabled} className="mt-3 flex gap-3">
                  <input type="hidden" name="appKey" value={definition.key} />
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      name="enabled"
                      type="checkbox"
                      defaultChecked={app?.enabled ?? true}
                    />
                    App enabled
                  </label>
                  <button className="rounded-lg border border-slate-300 px-3 py-1 text-sm">
                    Save
                  </button>
                </form>
                <form action={updateDefaultAppAccess} className="mt-3 flex gap-3">
                  <input type="hidden" name="appKey" value={definition.key} />
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      name="enabled"
                      type="checkbox"
                      defaultChecked={defaultAccess?.enabled ?? true}
                    />
                    Default for new users
                  </label>
                  <select
                    name="accessLevel"
                    defaultValue={
                      defaultAccess?.accessLevel ?? definition.defaultAccessLevel
                    }
                    className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
                  >
                    {accessLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                  <button className="rounded-lg border border-slate-300 px-3 py-1 text-sm">
                    Save
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-semibold">Users</h2>
        <div className="mt-4 space-y-4">
          {allUsers.map((user) => (
            <article
              key={user.id}
              className="rounded-xl border border-slate-200 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{user.name}</h3>
                  <p className="text-sm text-slate-600">{user.email}</p>
                </div>
                <form action={updateUserRole} className="flex gap-2">
                  <input type="hidden" name="userId" value={user.id} />
                  <select
                    name="role"
                    defaultValue={user.role}
                    className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  <button className="rounded-lg border border-slate-300 px-3 py-1 text-sm">
                    Save role
                  </button>
                </form>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {APP_CATALOG.map((app) => {
                  const access = userAccess.get(`${user.id}:${app.key}`);

                  return (
                    <form
                      key={app.key}
                      action={setUserAppAccess}
                      className="flex items-center gap-3 rounded-lg bg-slate-50 p-3"
                    >
                      <input type="hidden" name="userId" value={user.id} />
                      <input type="hidden" name="appKey" value={app.key} />
                      <label className="flex flex-1 items-center gap-2 text-sm">
                        <input
                          name="enabled"
                          type="checkbox"
                          defaultChecked={Boolean(access)}
                        />
                        {app.name}
                      </label>
                      <select
                        name="accessLevel"
                        defaultValue={access?.accessLevel ?? "viewer"}
                        className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
                      >
                        {accessLevels.map((level) => (
                          <option key={level} value={level}>
                            {level}
                          </option>
                        ))}
                      </select>
                      <button className="rounded-lg border border-slate-300 px-3 py-1 text-sm">
                        Save
                      </button>
                    </form>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
