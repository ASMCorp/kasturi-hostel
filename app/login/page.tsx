"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);
    let navigationStarted = false;
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error || "Sign-in failed. Check your details and try again.");
        return;
      }

      navigationStarted = true;
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Unable to reach the server. Check your connection and try again.");
    } finally {
      if (!navigationStarted) setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-3 py-4 sm:px-6 sm:py-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/70 bg-white shadow-2xl shadow-stone-900/10 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative hidden min-h-[650px] overflow-hidden bg-stone-900 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div aria-hidden="true" className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-yellow-300/20 blur-2xl" />
          <div aria-hidden="true" className="absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-brand/30 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-300 text-xl font-black text-stone-950">K</span>
            <div><p className="font-bold">Kasturi Girls Hostel</p><p className="text-xs text-stone-400">Management System</p></div>
          </div>
          <div className="relative max-w-md">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-300">A calmer front desk</p>
            <h1 className="mt-4 text-5xl font-bold leading-[1.05] tracking-tight">Residents and payments, kept in one place.</h1>
            <p className="mt-5 text-base leading-7 text-stone-300">Secure access for hostel administrators to manage resident records, monthly fees, and receipts.</p>
          </div>
          <p className="relative text-xs text-stone-500">Authorized administrators only</p>
        </section>

        <section className="flex min-h-[600px] items-center bg-[#fffdf6] px-5 py-10 sm:px-10 lg:min-h-[650px] lg:px-12">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-8 lg:hidden">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-900 text-xl font-black text-yellow-300">K</span>
              <p className="mt-3 text-sm font-bold text-stone-900">Kasturi Girls Hostel</p>
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">Admin portal</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-stone-900">Welcome back</h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">Sign in to continue to the management dashboard.</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label htmlFor="username" className="mb-1.5 block text-sm font-semibold text-stone-700">Username</label>
                <input
                  id="username"
                  name="username"
                  className="min-h-11 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-base text-stone-900 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/15 disabled:bg-stone-100 sm:text-sm"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  disabled={loading}
                  autoFocus
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-stone-700">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="min-h-11 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-base text-stone-900 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/15 disabled:bg-stone-100 sm:text-sm"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  disabled={loading}
                  required
                />
              </div>

              {error && (
                <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm font-medium text-red-800">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                aria-busy={loading}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-black focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-300/60 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && <LoadingSpinner label="Signing in" />}
                <span>{loading ? "Signing in…" : "Sign in"}</span>
              </button>
            </form>

            <p className="mt-8 text-center text-xs text-stone-500">Admin access only</p>
          </div>
        </section>
      </div>
    </main>
  );
}
