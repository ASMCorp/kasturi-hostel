import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import { Resident, Payment, formatTaka, formatMonth } from "@/lib/types";
import PrintButton from "@/components/PrintButton";

export const dynamic = "force-dynamic";

export default async function ReceiptPage({
  params,
}: {
  params: { id: string };
}) {
  const sb = getSupabaseAdmin();
  const { data: pData } = await sb
    .from("payments")
    .select("*")
    .eq("id", params.id)
    .single();
  if (!pData) notFound();
  const payment = pData as Payment;

  const { data: rData } = await sb
    .from("residents")
    .select("*")
    .eq("id", payment.resident_id)
    .single();
  if (!rData) notFound();
  const resident = rData as Resident;

  // All payments for that billing month, oldest first.
  const { data: monthPays } = await sb
    .from("payments")
    .select("*")
    .eq("resident_id", resident.id)
    .eq("period_month", payment.period_month)
    .order("paid_at", { ascending: true });

  const all = (monthPays as Payment[] | null) || [];

  // Show every transaction made up to and including the one being printed.
  const cutoff = new Date(payment.paid_at).getTime();
  const shown = all.filter(
    (p) => new Date(p.paid_at).getTime() <= cutoff || p.id === payment.id
  );

  const paidSoFar = shown.reduce((s, p) => s + Number(p.amount), 0);
  const fee = Number(resident.monthly_fee);
  const remaining = Math.max(fee - paidSoFar, 0);
  const isPaid = fee > 0 && paidSoFar >= fee;

  return (
    <div>
      <div className="no-print flex items-center justify-between mb-4">
        <Link
          href={`/dashboard/residents/${resident.id}`}
          className="text-sm text-brand hover:underline"
        >
          ← Back to resident
        </Link>
        <PrintButton />
      </div>

      <div className="print-area mx-auto max-w-2xl bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-brand pb-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="h-12 w-12 rounded-full bg-brand text-white flex items-center justify-center text-xl font-bold">
              K
            </span>
            <div>
              <div className="text-xl font-bold text-brand-dark">
                Kasturi Girls Hostel
              </div>
              <div className="text-xs text-gray-500">
                Payment Confirmation Receipt
              </div>
            </div>
          </div>
          <div className="text-right text-sm">
            <div className="font-semibold">Receipt #{payment.receipt_no}</div>
            <div className="text-gray-500">
              {new Date(payment.paid_at).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Resident — name, room, month only */}
        <div className="grid grid-cols-3 gap-x-6 text-sm mb-6">
          <Line k="Name" v={resident.name} />
          <Line k="Room" v={resident.room_number || "—"} />
          <Line k="Month" v={formatMonth(payment.period_month)} />
        </div>

        {/* Status */}
        <div className="mb-6">
          <span
            className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${
              isPaid
                ? "bg-brand-light text-brand-dark"
                : "bg-accent-light text-accent-dark"
            }`}
          >
            {isPaid ? "Paid ✓" : "Partial payment"}
          </span>
        </div>

        {/* All transactions for this month up to this receipt */}
        <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-2 font-medium">#</th>
                <th className="px-4 py-2 font-medium">Payment time</th>
                <th className="px-4 py-2 font-medium">Method</th>
                <th className="px-4 py-2 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((p, i) => (
                <tr
                  key={p.id}
                  className={`border-t border-gray-100 ${
                    p.id === payment.id ? "bg-accent-light/40" : ""
                  }`}
                >
                  <td className="px-4 py-2.5">{i + 1}</td>
                  <td className="px-4 py-2.5">
                    {new Date(p.paid_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5">{p.method || "—"}</td>
                  <td className="px-4 py-2.5 text-right font-medium">
                    {formatTaka(Number(p.amount))}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200 bg-gray-50">
                <td className="px-4 py-2.5 font-semibold" colSpan={3}>
                  Total paid
                </td>
                <td className="px-4 py-2.5 text-right font-bold text-brand-dark">
                  {formatTaka(paidSoFar)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Summary */}
        <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 text-sm mb-8">
          <Stat k="Monthly fee" v={formatTaka(fee)} />
          <Stat k="Total paid" v={formatTaka(paidSoFar)} />
          <Stat
            k="Remaining balance"
            v={remaining > 0 ? formatTaka(remaining) : "Fully paid ✓"}
            highlight={remaining > 0}
          />
        </div>

        {/* Signatures */}
        <div className="flex justify-between text-sm text-gray-500 pt-8">
          <div className="text-center">
            <div className="border-t border-gray-400 w-40 pt-1">
              Received by
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-gray-400 w-40 pt-1">
              Authorized signature
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          This is a computer-generated receipt from Kasturi Girls Hostel
          Management System.
        </p>
      </div>
    </div>
  );
}

function Line({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-xs text-gray-500">{k}</div>
      <div className="font-medium">{v}</div>
    </div>
  );
}

function Stat({
  k,
  v,
  highlight,
}: {
  k: string;
  v: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between px-4 py-2.5">
      <span className="text-gray-600">{k}</span>
      <span className={highlight ? "font-semibold text-accent-dark" : "font-medium"}>
        {v}
      </span>
    </div>
  );
}
