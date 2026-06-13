"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>();
  const [isPending, setIsPending] = useState(false);
  const registered = searchParams.get("registered") === "1";

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError(undefined);

    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
      callbackUrl: "/",
    });

    setIsPending(false);

    if (result?.ok) {
      window.location.href = result.url ?? "/";
      return;
    }

    setError("Invalid email or password.");
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {registered ? (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Your account was created. Log in to continue.
        </p>
      ) : null}
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Email</span>
        <input
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          autoComplete="email"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Password</span>
        <input
          name="password"
          type="password"
          required
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          autoComplete="current-password"
        />
      </label>
      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-slate-950 px-4 py-2 font-medium text-white disabled:opacity-60"
      >
        {isPending ? "Logging in..." : "Log in"}
      </button>
      <p className="text-center text-sm text-slate-600">
        Need an account?{" "}
        <Link className="font-medium text-slate-950" href="/register">
          Register
        </Link>
      </p>
    </form>
  );
}
