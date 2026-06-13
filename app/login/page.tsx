import { Suspense } from "react";

import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
            Jewish Apps
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Welcome back
          </h1>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </section>
    </main>
  );
}
