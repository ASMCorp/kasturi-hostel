"use client";

import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

type DashboardMonthPickerProps = {
  month: string;
};

export default function DashboardMonthPicker({
  month,
}: DashboardMonthPickerProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function changeMonth(nextMonth: string) {
    if (!nextMonth || nextMonth === month) return;

    const params = new URLSearchParams(window.location.search);
    params.set("month", nextMonth);
    const searchInput = document.getElementById("resident-search") as HTMLInputElement | null;
    const currentQuery = searchInput?.value.trim() ?? "";
    if (currentQuery) params.set("q", currentQuery);
    else params.delete("q");

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  return (
    <div className="flex items-end gap-2" aria-busy={isPending}>
      <div>
        <label
          htmlFor="dashboard-month"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-muted"
        >
          Billing month
        </label>
        <input
          id="dashboard-month"
          type="month"
          value={month}
          disabled={isPending}
          onChange={(event) => changeMonth(event.target.value)}
          className="control w-[10.5rem]"
        />
      </div>
      <span
        className={`flex h-11 w-8 items-center justify-center text-brand transition-opacity ${
          isPending ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden={!isPending}
      >
        {isPending && <LoadingSpinner label="Loading selected month" />}
      </span>
    </div>
  );
}
