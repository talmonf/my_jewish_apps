import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { apps, defaultAppAccess, userAppAccess, users } from "@/db/schema";
import { getCurrentSession } from "@/lib/auth";
import type { AppKey } from "@/lib/app-catalog";

export async function requireUser() {
  const session = await getCurrentSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return session.user;
}

export async function requireAdmin() {
  const user = await requireUser();

  if (user.role !== "admin") {
    redirect("/");
  }

  return user;
}

export async function requireAppAccess(appKey: AppKey) {
  const user = await requireUser();
  const [access] = await db
    .select({ appKey: userAppAccess.appKey })
    .from(userAppAccess)
    .innerJoin(apps, eq(apps.key, userAppAccess.appKey))
    .where(
      and(
        eq(userAppAccess.userId, user.id),
        eq(userAppAccess.appKey, appKey),
        eq(apps.enabled, true),
      ),
    )
    .limit(1);

  if (!access) {
    redirect("/");
  }

  return user;
}

export async function listAccessibleApps(userId: string) {
  return db
    .select({
      key: apps.key,
      name: apps.name,
      description: apps.description,
      href: apps.href,
      accessLevel: userAppAccess.accessLevel,
    })
    .from(userAppAccess)
    .innerJoin(apps, eq(apps.key, userAppAccess.appKey))
    .where(and(eq(userAppAccess.userId, userId), eq(apps.enabled, true)));
}

export async function applyDefaultAppAccess(userId: string) {
  const defaults = await db
    .select()
    .from(defaultAppAccess)
    .where(eq(defaultAppAccess.enabled, true));

  if (defaults.length === 0) {
    return;
  }

  await db
    .insert(userAppAccess)
    .values(
      defaults.map((entry) => ({
        userId,
        appKey: entry.appKey,
        accessLevel: entry.accessLevel,
      })),
    )
    .onConflictDoNothing();
}

export async function listUsersWithApps() {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      appKey: userAppAccess.appKey,
      accessLevel: userAppAccess.accessLevel,
    })
    .from(users)
    .leftJoin(userAppAccess, eq(userAppAccess.userId, users.id))
    .orderBy(users.email);
}
