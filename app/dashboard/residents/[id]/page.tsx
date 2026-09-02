import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import { recordPayment, deletePayment } from "@/app/actions";
import {
  Resident,
  Payment,
  currentMonth,
  monthToDate,
  formatTaka,
  formatMonth,
} from "@/lib/types";
import DeleteResidentButton from "@/components/DeleteResidentButton";

export const dynamic = "force-dynamic";

export default async function ResidentDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { month?: string; paid?: string };
}) {
  const month = searchParams.month || currentMonth();
  const paidJustNow = searchParams.paid === "1";
  const sb = getSupabaseAdmin();

  const { data: rData } = await sb
    .from("residents")
    .select("*")
    .eq("id", params.id)
    .single();
  if (!rData) notFound();
  const resident = rData as Resident;
  if (resident.deleted_at) notFound();

  const { data: allPayments } = await sb
    .from("payments")
    .select("*")
    .eq("resident_id", resident.id)
    .order("period_month", { ascending: false })
    .order("paid_at", { ascending: false });

  const payments = (allPayments as Payment[] | null) || [];
  const monthPayments = payments.filter(
    (p) => p.period_month === monthToDate(month)
  );
  const paidThisMonth = monthPayments.reduce((s, p) => s + Number(p.amount), 0);
  const fee = Number(resident.monthly_fee);
  const due = Math.max(fee - paidThisMonth, 0);
  const status =
    fee <= 0
      ? "No fee set"
      : paidThisMonth <= 0
      ? "Unpaid"
      : paidThisMonth < fee
      ? "Partial"
      : "Paid";

  // Latest payment for this month — used for a single receipt button
  // (the receipt already lists every payment up to and including it).
  const latestMonthPayment = monthPayments[0];

  // One receipt per month for the history table: the latest payment of each
  // month (payments are ordered month desc, paid_at desc, so the first row
  // seen for a month is its latest payment).
  const latestPaymentIdByMonth = new Map<string, string>();
  for (const p of payments) {
    if (!latestPaymentIdByMonth.has(p.period_month)) {
      latestPaymentIdByMonth.set(p.period_month, p.id);
    }
  }

  return (
    <div>
      <Link href="/dashboard" className="text-sm text-brand hover:underline">
        ← All residents
      </Link>

      {paidJustNow && (
        <div className="mt-3 rounded-lg bg-brand-light border border-brand/30 text-brand-dark px-4 py-3 text-sm font-medium">
          ✓ Payment successful
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-3 mt-2 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">{resident.name}</h1>
          <p className="text-sm text-gray-500">
            Room {resident.room_number || "—"} · {resident.class || "—"} ·{" "}
            {resident.school || "—"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/residents/${resident.id}/edit`}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            Edit info
          </Link>
          <DeleteResidentButton
            residentId={resident.id}
            residentName={resident.name}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-4 gap-3 mb-6 text-sm">
        <Info label="Age" value={resident.age?.toString() || "—"} />
        <Info label="Phone" value={resident.phone || "—"} />
        <Info label="Monthly fee" value={formatTaka(fee)} />
        <Info label="Status" value={resident.active ? "Active" : "Inactive"} />
      </div>

      {/* Month picker */}
      <form className="flex items-end gap-2 mb-4" action={`/dashboard/residents/${resident.id}`}>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Billing month</label>
          <input
            type="month"
            name="month"
            defaultValue={month}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <button className="rounded-lg bg-gray-800 text-white px-4 py-2 text-sm">
          View
        </button>
      </form>

      {/* This month summary + record payment */}
      <div className="grid md:grid-cols-2 gap-5 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-brand-dark mb-1">
            {formatMonth(monthToDate(month))}
          </h2>
          <div className="flex items-center gap-2 mb-4">
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                status === "Paid"
                  ? "bg-green-100 text-green-700"
                  : status === "Partial"
                  ? "bg-amber-100 text-amber-700"
                  : status === "Unpaid"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {status}
            </span>
          </div>
          <dl className="space-y-1 text-sm">
            <Row k="Fee" v={formatTaka(fee)} />
            <Row k="Paid" v={formatTaka(paidThisMonth)} />
            <Row k="Remaining" v={formatTaka(due)} strong />
          </dl>

          {monthPayments.length > 0 && (
            <div className="mt-4 border-t border-gray-100 pt-3">
              <div className="text-xs text-gray-500 mb-2">Payments this month</div>
              <ul className="space-y-1.5 text-sm">
                {monthPayments.map((p) => (
                  <li key={p.id} className="flex items-center justify-between">
                    <span>
                      {formatTaka(Number(p.amount))}
                      <span className="text-gray-400 text-xs">
                        {" "}
                        · {new Date(p.paid_at).toLocaleDateString()}
                        {p.method ? ` · ${p.method}` : ""}
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <form action={deletePayment}>
                        <input type="hidden" name="id" value={p.id} />
                        <input
                          type="hidden"
                          name="resident_id"
                          value={resident.id}
                        />
                        <button className="text-red-500 text-xs hover:underline">
                          Delete
                        </button>
                      </form>
                    </span>
                  </li>
                ))}
              </ul>

              {latestMonthPayment && (
                <Link
                  href={`/dashboard/receipt/${latestMonthPayment.id}`}
                  className="mt-3 inline-flex items-center justify-center w-full rounded-lg border border-brand text-brand px-3 py-2 text-sm font-medium hover:bg-brand-light"
                >
                  🖨 Print receipt
                </Link>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-brand-dark mb-3">Record a payment</h2>
          <form action={recordPayment} className="space-y-3">
            <input type="hidden" name="resident_id" value={resident.id} />
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Billing month
              </label>
              <input
                type="month"
                name="period_month"
                defaultValue={month}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Amount (৳){due > 0 ? ` · remaining ${formatTaka(due)}` : ""}
              </label>
              <input
                type="number"
                name="amount"
                step="0.01"
                min="0.01"
                defaultValue={due > 0 ? due : ""}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Method (optional)
              </label>
              <input
                name="method"
                placeholder="Cash, bKash, bank…"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Note (optional)
              </label>
              <input
                name="note"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <button className="w-full rounded-lg bg-brand text-white py-2 text-sm font-medium hover:bg-brand-dark">
              Save payment
            </button>
          </form>
        </div>
      </div>

      {/* Full history */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 font-semibold text-brand-dark">
          Payment history
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-2 font-medium">Month</th>
              <th className="px-4 py-2 font-medium">Amount</th>
              <th className="px-4 py-2 font-medium">Date</th>
              <th className="px-4 py-2 font-medium">Method</th>
              <th className="px-4 py-2 font-medium">Receipt</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No payments recorded yet.
                </td>
              </tr>
            )}
            {payments.map((p) => (
              <tr key={p.id} className="border-t border-gray-50">
                <td className="px-4 py-2">{formatMonth(p.period_month)}</td>
                <td className="px-4 py-2">{formatTaka(Number(p.amount))}</td>
                <td className="px-4 py-2">
                  {new Date(p.paid_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-2">{p.method || "—"}</td>
                <td className="px-4 py-2">
                  {latestPaymentIdByMonth.get(p.period_month) === p.id ? (
                    <Link
                      href={`/dashboard/receipt/${p.id}`}
                      className="text-brand hover:underline"
                    >
                      Print receipt
                    </Link>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className="text-gray-500">{k}</dt>
      <dd className={strong ? "font-semibold text-brand-dark" : ""}>{v}</dd>
    </div>
  );
}
