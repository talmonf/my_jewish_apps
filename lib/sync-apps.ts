import { db } from "@/db";
import { apps, defaultAppAccess } from "@/db/schema";
import { APP_CATALOG, type AppKey } from "@/lib/app-catalog";

export async function syncAppsFromCatalog() {
  for (const app of APP_CATALOG) {
    await ensureAppRegistered(app.key);
  }
}

export async function ensureAppRegistered(appKey: AppKey) {
  const app = APP_CATALOG.find((entry) => entry.key === appKey);
  if (!app) {
    throw new Error(`Unknown app key: ${appKey}`);
  }

  await db
    .insert(apps)
    .values({
      key: app.key,
      name: app.name,
      description: app.description,
      href: app.href,
      enabled: true,
    })
    .onConflictDoUpdate({
      target: apps.key,
      set: {
        name: app.name,
        description: app.description,
        href: app.href,
      },
    });

  await db
    .insert(defaultAppAccess)
    .values({
      appKey: app.key,
      accessLevel: app.defaultAccessLevel,
      enabled: true,
    })
    .onConflictDoNothing();
}
