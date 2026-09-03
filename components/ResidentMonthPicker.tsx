"use client";

import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function ResidentMonthPicker({ month }: { month: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function changeMonth(nextMonth: string) {
    if (!nextMonth || nextMonth === month) return;

    const params = new URLSearchParams(window.location.search);
    params.set("month", nextMonth);
    params.delete("paid");

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  return (
    <div className="flex min-w-0 flex-col gap-2 min-[380px]:flex-row min-[380px]:items-end" aria-busy={isPending}>
      <div className="min-w-0">
        <label htmlFor="resident-billing-month" className="mb-1 block text-xs font-medium text-stone-300">
          Billing month
        </label>
        <input
          id="resident-billing-month"
          type="month"
          value={month}
          disabled={isPending}
          onChange={(event) => changeMonth(event.target.value)}
          className="min-h-11 w-full rounded-xl border border-stone-600 bg-stone-800 px-3 py-2 text-sm text-white outline-none focus:border-yellow-300 focus:ring-4 focus:ring-yellow-300/20 disabled:opacity-60"
        />
      </div>
      <span className="flex min-h-11 min-w-28 items-center justify-center gap-2 rounded-xl bg-yellow-300 px-4 py-2 text-sm font-bold text-stone-950" aria-live="polite">
        {isPending && <LoadingSpinner label="Loading selected month" />}
        {isPending ? "Loading…" : "Select month"}
      </span>
    </div>
  );
}
