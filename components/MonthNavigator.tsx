"use client";

import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { formatMonth, monthToDate } from "@/lib/types";

type Tone = "light" | "dark";

function shiftMonth(month: string, delta: number): string {
  const [year, mon] = month.split("-").map(Number);
  const date = new Date(year, mon - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export default function MonthNavigator({
  month,
  tone = "light",
  dropParams = [],
}: {
  month: string;
  tone?: Tone;
  dropParams?: string[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function changeMonth(nextMonth: string) {
    if (!nextMonth || nextMonth === month) return;

    const params = new URLSearchParams(window.location.search);
    params.set("month", nextMonth);
    for (const key of dropParams) params.delete(key);

    const searchInput = document.getElementById(
      "resident-search",
    ) as HTMLInputElement | null;
    if (searchInput) {
      const currentQuery = searchInput.value.trim();
      if (currentQuery) params.set("q", currentQuery);
      else params.delete("q");
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  const isDark = tone === "dark";
  const arrowClass = isDark
    ? "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white transition hover:bg-white/15 focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/30 disabled:opacity-50"
    : "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line bg-white text-charcoal transition hover:border-brand/40 hover:bg-brand-light focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/20 disabled:opacity-50";

  return (
    <div className="min-w-0" aria-busy={isPending}>
      <div className="flex items-stretch gap-2">
        <button
          type="button"
          onClick={() => changeMonth(shiftMonth(month, -1))}
          disabled={isPending}
          className={arrowClass}
          aria-label="Previous month"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-4 w-4" aria-hidden="true">
            <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Billing month</span>
          <input
            type="month"
            value={month}
            disabled={isPending}
            onChange={(event) => changeMonth(event.target.value)}
            className={
              isDark
                ? "control-dark h-11 w-full min-w-[9.5rem] [color-scheme:dark]"
                : "control h-11 w-full min-w-[9.5rem]"
            }
            aria-label={`Billing month, currently ${formatMonth(monthToDate(month))}`}
          />
          {isPending && (
            <span
              className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 ${isDark ? "text-accent" : "text-brand"}`}
            >
              <LoadingSpinner label="Loading selected month" />
            </span>
          )}
        </label>

        <button
          type="button"
          onClick={() => changeMonth(shiftMonth(month, 1))}
          disabled={isPending}
          className={arrowClass}
          aria-label="Next month"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-4 w-4" aria-hidden="true">
            <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
