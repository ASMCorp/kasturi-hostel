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
  "no-fee": "border-slate-200 bg-slate-50 text-slate-600",
};

const labels: Record<Status, string> = {
  paid: "Paid",
  partial: "Partial",
  unpaid: "Unpaid",
  inactive: "Inactive",
  "no-fee": "No fee set",
};

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {label ?? labels[status]}
    </span>
  );
}
