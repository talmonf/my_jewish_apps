"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db";
import { users } from "@/db/schema";
import { applyDefaultAppAccess } from "@/lib/access";
import { hashPassword } from "@/lib/password";

const registerSchema = z.object({
  name: z.string().min(2, "Name is required."),
  email: z.string().email("Enter a valid email.").transform((value) => value.toLowerCase()),
  password: z.string().min(8, "Use at least 8 characters."),
});

export type RegisterState = {
  error?: string;
};

export async function registerUser(
  _state: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid registration." };
  }

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, parsed.data.email))
    .limit(1);

  if (existing.length > 0) {
    return { error: "An account already exists for that email." };
  }

  const [user] = await db
    .insert(users)
    .values({
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: await hashPassword(parsed.data.password),
      role: "user",
    })
    .returning({ id: users.id });

  await applyDefaultAppAccess(user.id);
  redirect("/login?registered=1");
}
