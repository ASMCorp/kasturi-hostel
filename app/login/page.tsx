"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/components/LanguageProvider";

const fieldClass =
  "min-h-11 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-base text-charcoal outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/15 disabled:bg-stone-100 sm:text-sm";

export default function LoginPage() {
  const { dictionary: t } = useLanguage();
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
        setError(data.error || t.login.signInFailed);
        return;
      }

      navigationStarted = true;
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError(t.login.connectionError);
    } finally {
      if (!navigationStarted) setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-3 py-4 sm:px-6 sm:py-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-shell border border-white/70 bg-white shadow-shell lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative hidden min-h-[650px] overflow-hidden bg-charcoal p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div aria-hidden="true" className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/20 blur-2xl" />
          <div aria-hidden="true" className="absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-brand/30 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-xl font-black text-charcoal">K</span>
            <div><p className="font-bold">{t.common.hostelName}</p><p className="text-xs text-white/60">{t.common.managementSystem}</p></div>
          </div>
          <div className="relative max-w-md">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">{t.login.calmerFrontDesk}</p>
            <h1 className="mt-4 text-5xl font-bold leading-[1.05] tracking-tight">{t.login.heroTitle}</h1>
            <p className="mt-5 text-base leading-7 text-white/70">{t.login.heroDescription}</p>
          </div>
          <p className="relative text-xs text-white/50">{t.login.authorizedOnly}</p>
        </section>

        <section className="flex min-h-[600px] items-center bg-surface px-5 py-10 sm:px-10 lg:min-h-[650px] lg:px-12">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-5 flex justify-end"><LanguageSwitcher /></div>
            <div className="mb-8 lg:hidden">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-charcoal text-xl font-black text-accent">K</span>
              <p className="mt-3 text-sm font-bold text-charcoal">{t.common.hostelName}</p>
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">{t.login.adminPortal}</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-charcoal">{t.login.welcomeBack}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{t.login.instruction}</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label htmlFor="username" className="field-label">{t.login.username}</label>
                <input
                  id="username"
                  name="username"
                  className={fieldClass}
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
                <label htmlFor="password" className="field-label">{t.login.password}</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className={fieldClass}
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
                className="btn-dark w-full py-2.5 text-sm font-bold"
              >
                {loading && <LoadingSpinner label={t.login.signingInLabel} />}
                <span>{loading ? t.login.signingIn : t.login.signIn}</span>
              </button>
            </form>

            <p className="mt-8 text-center text-xs text-muted">{t.login.adminOnly}</p>
          </div>
        </section>
      </div>
    </main>
  );
}
