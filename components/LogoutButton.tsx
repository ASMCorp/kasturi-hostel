"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useLanguage } from "@/components/LanguageProvider";

export default function LogoutButton() {
  const { dictionary: t } = useLanguage();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function logout() {
    if (pending) return;

    setPending(true);
    setError("");

    try {
      const response = await fetch("/api/logout", { method: "POST" });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(data?.error || t.nav.logoutError);
      }

      router.replace("/login");
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : t.nav.logoutConnectionError,
      );
      setPending(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={logout}
        disabled={pending}
        aria-disabled={pending}
        aria-busy={pending}
        className="btn-secondary whitespace-nowrap"
      >
        {pending && <LoadingSpinner label={t.nav.loggingOutLabel} />}
        <span>{pending ? t.nav.loggingOut : t.nav.logOut}</span>
      </button>
      <p
        aria-live="assertive"
        className={`absolute right-0 top-full z-10 mt-2 w-64 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-800 shadow-card ${
          error ? "block" : "hidden"
        }`}
      >
        {error}
      </p>
    </div>
  );
}
