import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  type Resident,
  type Payment,
  currentMonth,
  monthToDate,
  formatTaka,
  formatMonth,
} from "@/lib/types";
import DeleteResidentButton from "@/components/DeleteResidentButton";
import DeletePaymentButton from "@/components/DeletePaymentButton";
import PaymentForm from "@/components/PaymentForm";
import ResidentMonthPicker from "@/components/ResidentMonthPicker";

export const dynamic = "force-dynamic";

export default async function ResidentDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { month?: string; paid?: string };
}) {
  const month = /^[1-9]\d{3}-(0[1-9]|1[0-2])$/.test(searchParams.month || "")
    ? searchParams.month!
    : currentMonth();
  const paidJustNow = searchParams.paid === "1";
  const sb = getSupabaseAdmin();

  const [residentResult, paymentsResult] = await Promise.all([
    sb.from("residents").select("*").eq("id", params.id).single(),
    sb
      .from("payments")
      .select("*")
      .eq("resident_id", params.id)
      .order("period_month", { ascending: false })
      .order("paid_at", { ascending: false }),
  ]);

  if (residentResult.error) {
    if (residentResult.error.code === "PGRST116") notFound();
    throw new Error("Unable to load this resident right now.");
  }
  if (!residentResult.data) notFound();
  if (paymentsResult.error) throw new Error("Unable to load payment history right now.");

  const resident = residentResult.data as Resident;
  if (resident.deleted_at) notFound();
  const payments = (paymentsResult.data as Payment[] | null) || [];
  const monthPayments = payments.filter((payment) => payment.period_month === monthToDate(month));
  const paidThisMonth = monthPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  const fee = Number(resident.monthly_fee);
  const due = Math.max(fee - paidThisMonth, 0);
  const status = fee <= 0 ? "No fee set" : paidThisMonth <= 0 ? "Unpaid" : paidThisMonth < fee ? "Partial" : "Paid";
  const latestMonthPayment = monthPayments[0];

  const latestPaymentIdByMonth = new Map<string, string>();
  for (const payment of payments) {
    if (!latestPaymentIdByMonth.has(payment.period_month)) {
      latestPaymentIdByMonth.set(payment.period_month, payment.id);
    }
  }

  return (
    <div className="min-w-0 space-y-5">
      <Link
        href="/dashboard"
        className="inline-flex min-h-11 items-center text-sm font-semibold text-brand hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/20"
      >
        ← All residents
      </Link>

      {paidJustNow && (
        <div role="status" className="rounded-2xl border border-green-300 bg-green-50 px-4 py-3 text-sm font-semibold text-green-900">
          Payment recorded successfully.
        </div>
      )}

      <section className="overflow-hidden rounded-3xl border border-white/80 bg-gradient-to-br from-brand-light via-white to-accent-light p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">Resident profile</p>
            <h1 className="mt-2 break-words text-3xl font-bold tracking-tight text-charcoal sm:text-4xl">{resident.name}</h1>
            <p className="mt-2 text-sm leading-6 text-muted">
              Room {resident.room_number || "not assigned"} · {resident.class || "Class not set"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-3 py-1.5 text-xs font-bold ${resident.active ? "border-green-300 bg-green-100 text-green-900" : "border-stone-300 bg-stone-100 text-stone-700"}`}>
              {resident.active ? "Status: Active" : "Status: Inactive"}
            </span>
            <Link
              href={`/dashboard/residents/${resident.id}/edit`}
              className="btn-dark"
            >
              Edit information
            </Link>
          </div>
        </div>
      </section>

      <div className="grid min-w-0 gap-5 lg:grid-cols-12">
        <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm lg:col-span-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Resident information</p>
          <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5">
            <Info label="Age" value={resident.age?.toString() || "Not provided"} />
            <Info label="Phone" value={resident.phone || "Not provided"} />
            <Info label="Class" value={resident.class || "Not provided"} />
            <Info label="Room" value={resident.room_number || "Not assigned"} />
            <div className="col-span-2">
              <Info label="School / Institution" value={resident.school || "Not provided"} />
            </div>
          </dl>
        </section>

        <section className="rounded-2xl bg-stone-900 p-5 text-white shadow-sm lg:col-span-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-yellow-300">Monthly billing</p>
              <h2 className="mt-1 text-xl font-bold">{formatMonth(monthToDate(month))}</h2>
            </div>
            <ResidentMonthPicker month={month} />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <BillingMetric label="Monthly fee" value={formatTaka(fee)} />
            <BillingMetric label="Paid" value={formatTaka(paidThisMonth)} />
            <div className="col-span-2 sm:col-span-1"><BillingMetric label="Remaining" value={formatTaka(due)} emphasis /></div>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-stone-700 pt-4">
            <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${status === "Paid" ? "bg-green-300 text-green-950" : status === "Partial" ? "bg-yellow-300 text-stone-950" : status === "Unpaid" ? "bg-red-200 text-red-950" : "bg-stone-700 text-stone-100"}`}>
              Payment status: {status}
            </span>
            {latestMonthPayment && (
              <Link href={`/dashboard/receipt/${latestMonthPayment.id}`} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-stone-600 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-300/30">
                Print monthly receipt
              </Link>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm lg:col-span-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Payment action</p>
          <h2 className="mb-5 mt-1 text-xl font-bold text-stone-900">Record a payment</h2>
          <PaymentForm key={month} residentId={resident.id} month={month} due={due} />
        </section>

        <section className="min-w-0 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm lg:col-span-7">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Selected month</p>
              <h2 className="mt-1 text-xl font-bold text-stone-900">Transactions</h2>
            </div>
            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">{monthPayments.length} recorded</span>
          </div>
          {monthPayments.length === 0 ? (
            <p className="mt-8 rounded-xl bg-stone-50 px-4 py-8 text-center text-sm text-stone-500">No payments recorded for this month.</p>
          ) : (
            <ul className="mt-5 divide-y divide-stone-100">
              {monthPayments.map((payment) => (
                <li key={payment.id} className="flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-bold text-stone-900">{formatTaka(Number(payment.amount))}</p>
                    <p className="break-words text-xs text-stone-500">{new Date(payment.paid_at).toLocaleDateString()} · {payment.method || "Method not specified"}</p>
                  </div>
                  <DeletePaymentButton paymentId={payment.id} residentId={resident.id} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="min-w-0 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-200 px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">All transactions</p>
          <h2 className="mt-1 text-xl font-bold text-stone-900">Payment history</h2>
        </div>
        {payments.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-stone-500">No payments recorded yet.</p>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                  <tr><th className="px-5 py-3 font-semibold">Month</th><th className="px-5 py-3 font-semibold">Amount</th><th className="px-5 py-3 font-semibold">Date</th><th className="px-5 py-3 font-semibold">Method</th><th className="px-5 py-3 font-semibold">Receipt</th></tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-5 py-3 font-medium text-stone-900">{formatMonth(payment.period_month)}</td>
                      <td className="px-5 py-3">{formatTaka(Number(payment.amount))}</td>
                      <td className="px-5 py-3">{new Date(payment.paid_at).toLocaleDateString()}</td>
                      <td className="px-5 py-3">{payment.method || "—"}</td>
                      <td className="px-5 py-3">{latestPaymentIdByMonth.get(payment.period_month) === payment.id ? <ReceiptLink id={payment.id} /> : <span className="text-stone-300">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="divide-y divide-stone-100 md:hidden">
              {payments.map((payment) => (
                <li key={payment.id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0"><p className="font-bold text-stone-900">{formatMonth(payment.period_month)}</p><p className="mt-1 text-xs text-stone-500">{new Date(payment.paid_at).toLocaleDateString()} · {payment.method || "Method not specified"}</p></div>
                    <p className="shrink-0 font-bold text-stone-900">{formatTaka(Number(payment.amount))}</p>
                  </div>
                  {latestPaymentIdByMonth.get(payment.period_month) === payment.id && <ReceiptLink id={payment.id} />}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="rounded-2xl border border-red-200 bg-red-50/60 p-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-700">Destructive controls</p>
        <h2 className="mt-1 text-lg font-bold text-stone-900">Remove resident</h2>
        <p className="mb-4 mt-1 text-sm text-stone-600">Payment history will be kept, but the resident will be removed from active views.</p>
        <DeleteResidentButton residentId={resident.id} residentName={resident.name} />
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0"><dt className="text-xs font-medium text-stone-500">{label}</dt><dd className="mt-1 break-words text-sm font-semibold text-stone-900">{value}</dd></div>;
}

function BillingMetric({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return <div className={`rounded-xl border p-3 ${emphasis ? "border-yellow-300/40 bg-yellow-300/10" : "border-stone-700 bg-stone-800"}`}><p className="text-xs text-stone-400">{label}</p><p className={`mt-1 break-words text-lg font-bold ${emphasis ? "text-yellow-300" : "text-white"}`}>{value}</p></div>;
}

function ReceiptLink({ id }: { id: string }) {
  return <Link href={`/dashboard/receipt/${id}`} className="inline-flex min-h-11 items-center text-sm font-semibold text-brand hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/20">View receipt</Link>;
}
