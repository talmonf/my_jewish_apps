"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import {
  apps,
  defaultAppAccess,
  userAppAccess,
  users,
  type AppAccessLevel,
  type UserRole,
} from "@/db/schema";
import { requireAdmin } from "@/lib/access";
import { APP_KEYS, type AppKey } from "@/lib/app-catalog";
import { hashPassword } from "@/lib/password";
import { ensureAppRegistered } from "@/lib/sync-apps";

const roles = ["admin", "teacher", "student", "user"] as const;
const accessLevels = ["viewer", "teacher", "admin"] as const;

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: z.string().min(8),
  role: z.enum(roles),
});

export async function createUser(formData: FormData) {
  await requireAdmin();

  const parsed = createUserSchema.parse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  await db.insert(users).values({
    name: parsed.name,
    email: parsed.email,
    passwordHash: await hashPassword(parsed.password),
    role: parsed.role,
  });

  revalidatePath("/admin");
}

export async function updateUserRole(formData: FormData) {
  await requireAdmin();

  const userId = z.string().uuid().parse(formData.get("userId"));
  const role = z.enum(roles).parse(formData.get("role")) as UserRole;

  await db.update(users).set({ role }).where(eq(users.id, userId));
  revalidatePath("/admin");
}

export async function setUserAppAccess(formData: FormData) {
  await requireAdmin();

  const userId = z.string().uuid().parse(formData.get("userId"));
  const appKey = z.enum(APP_KEYS as [AppKey, ...AppKey[]]).parse(
    formData.get("appKey"),
  );
  const enabled = formData.get("enabled") === "on";
  const accessLevel = z.enum(accessLevels).parse(
    formData.get("accessLevel"),
  ) as AppAccessLevel;

  await ensureAppRegistered(appKey);

  if (!enabled) {
    await db
      .delete(userAppAccess)
      .where(
        and(eq(userAppAccess.userId, userId), eq(userAppAccess.appKey, appKey)),
      );
  } else {
    await db
      .insert(userAppAccess)
      .values({ userId, appKey, accessLevel })
      .onConflictDoUpdate({
        target: [userAppAccess.userId, userAppAccess.appKey],
        set: { accessLevel },
      });
  }

  revalidatePath("/admin");
}

export async function updateDefaultAppAccess(formData: FormData) {
  await requireAdmin();

  const appKey = z.enum(APP_KEYS as [AppKey, ...AppKey[]]).parse(
    formData.get("appKey"),
  );
  const enabled = formData.get("enabled") === "on";
  const accessLevel = z.enum(accessLevels).parse(
    formData.get("accessLevel"),
  ) as AppAccessLevel;

  await ensureAppRegistered(appKey);

  await db
    .insert(defaultAppAccess)
    .values({ appKey, enabled, accessLevel })
    .onConflictDoUpdate({
      target: defaultAppAccess.appKey,
      set: { enabled, accessLevel },
    });

  revalidatePath("/admin");
}

export async function setAppEnabled(formData: FormData) {
  await requireAdmin();

  const appKey = z.enum(APP_KEYS as [AppKey, ...AppKey[]]).parse(
    formData.get("appKey"),
  );
  const enabled = formData.get("enabled") === "on";

  await ensureAppRegistered(appKey);

  await db.update(apps).set({ enabled }).where(eq(apps.key, appKey));
  revalidatePath("/admin");
}
