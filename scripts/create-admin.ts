import { eq } from "drizzle-orm";

import { db } from "@/db";
import { apps, defaultAppAccess, userAppAccess, users } from "@/db/schema";
import { APP_CATALOG } from "@/lib/app-catalog";
import { hashPassword } from "@/lib/password";

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "Admin";

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required.");
  }

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required.");
  }

  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters.");
  }

  for (const app of APP_CATALOG) {
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
          enabled: true,
        },
      });

    await db
      .insert(defaultAppAccess)
      .values({
        appKey: app.key,
        accessLevel: app.defaultAccessLevel,
        enabled: true,
      })
      .onConflictDoUpdate({
        target: defaultAppAccess.appKey,
        set: {
          accessLevel: app.defaultAccessLevel,
          enabled: true,
        },
      });
  }

  const passwordHash = await hashPassword(password);
  const existingUser = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const [admin] =
    existingUser.length > 0
      ? await db
          .update(users)
          .set({
            name,
            passwordHash,
            role: "admin",
            updatedAt: new Date(),
          })
          .where(eq(users.email, email))
          .returning({ id: users.id })
      : await db
          .insert(users)
          .values({
            name,
            email,
            passwordHash,
            role: "admin",
          })
          .returning({ id: users.id });

  for (const app of APP_CATALOG) {
    await db
      .insert(userAppAccess)
      .values({
        userId: admin.id,
        appKey: app.key,
        accessLevel: "admin",
      })
      .onConflictDoUpdate({
        target: [userAppAccess.userId, userAppAccess.appKey],
        set: { accessLevel: "admin" },
      });
  }

  console.log(`Admin user ready: ${email}`);
}

createAdmin().catch((error) => {
  console.error(error);
  process.exit(1);
});
