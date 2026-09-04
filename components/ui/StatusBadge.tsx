"use client";

import { useLanguage } from "@/components/LanguageProvider";

type Status = "paid" | "partial" | "unpaid" | "inactive" | "no-fee";

type StatusBadgeProps = {
  status: Status;
  label?: string;
};

const styles: Record<Status, string> = {
  paid: "border-green-200 bg-green-50 text-green-800",
  partial: "border-amber-200 bg-amber-50 text-amber-800",
  unpaid: "border-red-200 bg-red-50 text-red-800",
  inactive: "border-stone-200 bg-stone-100 text-stone-600",
  "no-fee": "border-stone-200 bg-stone-100 text-stone-600",
};

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const { dictionary: t } = useLanguage();
  const labels: Record<Status, string> = {
    paid: t.status.paid,
    partial: t.status.partial,
    unpaid: t.status.unpaid,
    inactive: t.status.inactive,
    "no-fee": t.status.noFee,
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {label ?? labels[status]}
    </span>
  );
}
