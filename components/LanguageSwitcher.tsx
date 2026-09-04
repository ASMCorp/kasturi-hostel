"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n";
import { useLanguage } from "@/components/LanguageProvider";

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, dictionary: t } = useLanguage();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function selectLocale(nextLocale: Locale) {
    if (nextLocale === locale || isPending) return;
    document.cookie = `${LOCALE_COOKIE}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    startTransition(() => router.refresh());
  }

  return (
    <div
      role="group"
      aria-label={t.language.label}
      aria-busy={isPending}
      className="inline-flex rounded-xl border border-line bg-white p-1 shadow-sm"
    >
      {(["en", "bn"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => selectLocale(option)}
          disabled={isPending}
          aria-pressed={locale === option}
          className={`min-h-9 rounded-lg px-2.5 text-xs font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:opacity-60 ${
            locale === option
              ? "bg-charcoal text-white"
              : "text-muted hover:bg-stone-50 hover:text-charcoal"
          }`}
        >
          {option === "en" ? (compact ? "EN" : t.language.english) : t.language.bangla}
        </button>
      ))}
    </div>
  );
}
