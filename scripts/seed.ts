import "@/envConfig";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { defaultAppAccess, userAppAccess, users } from "@/db/schema";
import { APP_CATALOG } from "@/lib/app-catalog";
import { hashPassword } from "@/lib/password";
import { syncAppsFromCatalog } from "@/lib/sync-apps";

async function seed() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required.");
  }

  await syncAppsFromCatalog();

  for (const app of APP_CATALOG) {
    await db
      .insert(defaultAppAccess)
      .values({
        appKey: app.key,
        accessLevel: app.defaultAccessLevel,
        enabled: true,
      })
      .onConflictDoUpdate({
        target: defaultAppAccess.appKey,
        set: { accessLevel: app.defaultAccessLevel, enabled: true },
      });
  }

  const email = process.env.SEED_ADMIN_EMAIL?.toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME ?? "Admin";

  if (!email || !password) {
    console.log("Skipped admin seed: SEED_ADMIN_EMAIL/PASSWORD are missing.");
    return;
  }

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const [admin] =
    existing.length === 0
      ? await db.insert(users).values({
      name,
      email,
      passwordHash: await hashPassword(password),
      role: "admin",
        }).returning({ id: users.id })
      : existing;

  for (const app of APP_CATALOG) {
    await db
      .insert(userAppAccess)
      .values({ userId: admin.id, appKey: app.key, accessLevel: "admin" })
      .onConflictDoUpdate({
        target: [userAppAccess.userId, userAppAccess.appKey],
        set: { accessLevel: "admin" },
      });
  }

  console.log("Seed complete.");
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
