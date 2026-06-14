"use client";

import { PasswordInput } from "@/components/PasswordInput";
import Link from "next/link";
import { useActionState } from "react";

import { registerUser, type RegisterState } from "./actions";

const initialState: RegisterState = {};

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(
    registerUser,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Name</span>
        <input
          name="name"
          required
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          autoComplete="name"
        />
      </label>
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
      <PasswordInput
        containerClassName="block"
        label="Password"
        name="password"
        minLength={8}
        required
        autoComplete="new-password"
      />
      {state.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-slate-950 px-4 py-2 font-medium text-white disabled:opacity-60"
      >
        {isPending ? "Creating account..." : "Create account"}
      </button>
      <p className="text-center text-sm text-slate-600">
        Already registered?{" "}
        <Link className="font-medium text-slate-950" href="/login">
          Log in
        </Link>
      </p>
    </form>
  );
}
