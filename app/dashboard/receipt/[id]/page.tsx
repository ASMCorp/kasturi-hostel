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

  // Total paid for that billing month (for context on the receipt)
  const { data: monthPays } = await sb
    .from("payments")
    .select("amount")
    .eq("resident_id", resident.id)
    .eq("period_month", payment.period_month);
  const paidMonth =
    (monthPays as { amount: number }[] | null)?.reduce(
      (s, p) => s + Number(p.amount),
      0
    ) || 0;
  const fee = Number(resident.monthly_fee);
  const remaining = Math.max(fee - paidMonth, 0);

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

        {/* Resident */}
        <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-sm mb-6">
          <Line k="Name" v={resident.name} />
          <Line k="Room" v={resident.room_number || "—"} />
          <Line k="Class" v={resident.class || "—"} />
          <Line k="School / Institution" v={resident.school || "—"} />
          <Line k="Phone" v={resident.phone || "—"} />
          <Line k="Billing month" v={formatMonth(payment.period_month)} />
        </div>

        {/* Payment box */}
        <div className="bg-brand-light rounded-lg p-5 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Amount paid</span>
            <span className="text-2xl font-bold text-brand-dark">
              {formatTaka(Number(payment.amount))}
            </span>
          </div>
          {payment.method && (
            <div className="flex justify-between text-sm mt-2">
              <span className="text-gray-600">Method</span>
              <span>{payment.method}</span>
            </div>
          )}
          {payment.note && (
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-600">Note</span>
              <span>{payment.note}</span>
            </div>
          )}
        </div>

        {/* Month status */}
        <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 text-sm mb-8">
          <Stat k="Monthly fee" v={formatTaka(fee)} />
          <Stat k={`Total paid for ${formatMonth(payment.period_month)}`} v={formatTaka(paidMonth)} />
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
      <span className={highlight ? "font-semibold text-amber-700" : "font-medium"}>
        {v}
      </span>
    </div>
  );
}
