import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import { type Resident, type Payment, formatTaka, formatMonth } from "@/lib/types";
import PrintButton from "@/components/PrintButton";

export const dynamic = "force-dynamic";

export default async function ReceiptPage({ params }: { params: { id: string } }) {
  const sb = getSupabaseAdmin();
  const paymentResult = await sb.from("payments").select("*").eq("id", params.id).single();

  if (paymentResult.error) {
    if (paymentResult.error.code === "PGRST116") notFound();
    throw new Error("Unable to load this receipt right now.");
  }
  if (!paymentResult.data) notFound();
  const payment = paymentResult.data as Payment;

  const [residentResult, monthPaymentsResult] = await Promise.all([
    sb.from("residents").select("*").eq("id", payment.resident_id).single(),
    sb
      .from("payments")
      .select("*")
      .eq("resident_id", payment.resident_id)
      .eq("period_month", payment.period_month)
      .order("paid_at", { ascending: true }),
  ]);

  if (residentResult.error) {
    if (residentResult.error.code === "PGRST116") notFound();
    throw new Error("Unable to load the resident for this receipt.");
  }
  if (!residentResult.data) notFound();
  if (monthPaymentsResult.error) throw new Error("Unable to load the receipt transactions.");

  const resident = residentResult.data as Resident;
  const all = (monthPaymentsResult.data as Payment[] | null) || [];
  const cutoff = new Date(payment.paid_at).getTime();
  const shown = all.filter((item) => new Date(item.paid_at).getTime() <= cutoff || item.id === payment.id);
  const paidSoFar = shown.reduce((sum, item) => sum + Number(item.amount), 0);
  const fee = Number(resident.monthly_fee);
  const remaining = Math.max(fee - paidSoFar, 0);
  const isPaid = fee > 0 && paidSoFar >= fee;

  return (
    <div className="min-w-0">
      <div className="no-print mb-5 flex flex-col gap-3 min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between">
        <Link href={`/dashboard/residents/${resident.id}`} className="inline-flex min-h-11 items-center text-sm font-semibold text-brand hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/20">
          ← Back to resident
        </Link>
        <PrintButton />
      </div>

      <article className="print-area mx-auto max-w-3xl overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
        <header className="bg-stone-900 p-5 text-white sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-300 text-xl font-black text-stone-950">K</span>
              <div className="min-w-0">
                <h1 className="break-words text-lg font-bold sm:text-xl">Kasturi Girls Hostel</h1>
                <p className="text-xs text-stone-300">Payment confirmation receipt</p>
              </div>
            </div>
            <div className="min-w-0 text-left text-sm sm:text-right">
              <p className="break-all font-semibold">Receipt #{payment.receipt_no}</p>
              <p className="mt-1 text-xs text-stone-300">{new Date(payment.paid_at).toLocaleString()}</p>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-8">
          <section className="grid gap-3 rounded-2xl bg-stone-50 p-4 sm:grid-cols-3">
            <Line label="Resident" value={resident.name} />
            <Line label="Room" value={resident.room_number || "Not assigned"} />
            <Line label="Billing month" value={formatMonth(payment.period_month)} />
          </section>

          <div className="my-5">
            <span className={`inline-flex rounded-full px-3 py-1.5 text-sm font-bold ${isPaid ? "bg-green-100 text-green-900" : "bg-yellow-200 text-stone-950"}`}>
              Payment status: {isPaid ? "Paid in full" : "Partially paid"}
            </span>
          </div>

          <section aria-labelledby="receipt-transactions-title">
            <h2 id="receipt-transactions-title" className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-brand">Transactions included</h2>
            <div className="hidden overflow-hidden rounded-xl border border-stone-200 sm:block print:block">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
                  <tr><th className="px-4 py-3 font-semibold">#</th><th className="px-4 py-3 font-semibold">Payment time</th><th className="px-4 py-3 font-semibold">Method</th><th className="px-4 py-3 text-right font-semibold">Amount</th></tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {shown.map((item, index) => (
                    <tr key={item.id} className={item.id === payment.id ? "bg-yellow-50" : ""}>
                      <td className="px-4 py-3">{index + 1}</td>
                      <td className="px-4 py-3">{new Date(item.paid_at).toLocaleString()}</td>
                      <td className="px-4 py-3">{item.method || "—"}</td>
                      <td className="px-4 py-3 text-right font-semibold">{formatTaka(Number(item.amount))}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot><tr className="border-t-2 border-stone-200 bg-stone-50"><td className="px-4 py-3 font-bold" colSpan={3}>Total paid</td><td className="px-4 py-3 text-right font-bold">{formatTaka(paidSoFar)}</td></tr></tfoot>
              </table>
            </div>

            <ul className="space-y-3 sm:hidden print:hidden">
              {shown.map((item, index) => (
                <li key={item.id} className={`rounded-xl border p-3 ${item.id === payment.id ? "border-yellow-300 bg-yellow-50" : "border-stone-200"}`}>
                  <div className="flex items-start justify-between gap-3"><p className="text-xs font-semibold text-stone-500">Payment {index + 1}</p><p className="shrink-0 font-bold text-stone-900">{formatTaka(Number(item.amount))}</p></div>
                  <p className="mt-2 text-sm text-stone-700">{new Date(item.paid_at).toLocaleString()}</p>
                  <p className="mt-1 text-xs text-stone-500">Method: {item.method || "Not specified"}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6 divide-y divide-stone-100 rounded-xl border border-stone-200 text-sm">
            <Stat label="Monthly fee" value={formatTaka(fee)} />
            <Stat label="Total paid" value={formatTaka(paidSoFar)} />
            <Stat label="Remaining balance" value={remaining > 0 ? formatTaka(remaining) : "Fully paid"} highlight={remaining > 0} />
          </section>

          <section className="mt-16 grid grid-cols-2 gap-5 text-center text-xs text-stone-500 sm:gap-16 sm:text-sm">
            <div className="min-w-0 border-t border-stone-400 pt-2">Received by</div>
            <div className="min-w-0 border-t border-stone-400 pt-2">Authorized signature</div>
          </section>

          <p className="mt-10 text-center text-xs leading-5 text-stone-400">This is a computer-generated receipt from Kasturi Girls Hostel Management System.</p>
        </div>
      </article>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0"><p className="text-xs font-medium text-stone-500">{label}</p><p className="mt-1 break-words text-sm font-semibold text-stone-900">{value}</p></div>;
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return <div className="flex items-center justify-between gap-3 px-4 py-3"><span className="text-stone-600">{label}</span><span className={`break-words text-right font-semibold ${highlight ? "text-red-700" : "text-stone-900"}`}>{value}</span></div>;
}
