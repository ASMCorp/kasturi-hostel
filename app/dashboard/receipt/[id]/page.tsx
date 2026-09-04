import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import { type Resident, type Payment } from "@/lib/types";
import { formatCurrency, formatDateTime, formatMonth, formatNumber, formatPaymentMethod } from "@/lib/i18n";
import { getLocale, getServerDictionary } from "@/lib/i18n-server";
import PrintButton from "@/components/PrintButton";

export const dynamic = "force-dynamic";

export default async function ReceiptPage({ params }: { params: { id: string } }) {
  const locale = getLocale();
  const t = getServerDictionary();
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
          ← {t.receipt.back}
        </Link>
        <PrintButton />
      </div>

      <article className="print-area mx-auto max-w-3xl overflow-hidden rounded-card border border-line bg-white shadow-card">
        <header className="bg-charcoal p-5 text-white sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-xl font-black text-charcoal">K</span>
              <div className="min-w-0">
                <h1 className="break-words text-lg font-bold sm:text-xl">{t.common.hostelName}</h1>
                <p className="text-xs text-white/70">{t.receipt.title}</p>
              </div>
            </div>
            <div className="min-w-0 text-left text-sm sm:text-right">
              <p className="break-all font-semibold">{t.receipt.receipt} #{formatNumber(payment.receipt_no, locale)}</p>
              <p className="mt-1 text-xs text-white/70">{formatDateTime(payment.paid_at, locale)}</p>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-8">
          <section className="grid gap-3 rounded-2xl bg-stone-50 p-4 sm:grid-cols-3">
            <Line label={t.receipt.resident} value={resident.name} />
            <Line label={t.receipt.room} value={resident.room_number || t.common.notAssigned} />
            <Line label={t.receipt.billingMonth} value={formatMonth(payment.period_month, locale)} />
          </section>

          <div className="my-5">
            <span className={`inline-flex rounded-full px-3 py-1.5 text-sm font-bold ${isPaid ? "bg-green-100 text-green-900" : "bg-accent-light text-charcoal"}`}>
              {t.receipt.paymentStatus} {isPaid ? t.receipt.paidInFull : t.receipt.partiallyPaid}
            </span>
          </div>

          <section aria-labelledby="receipt-transactions-title">
            <h2 id="receipt-transactions-title" className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-brand">{t.receipt.transactionsIncluded}</h2>
            <div className="hidden overflow-hidden rounded-xl border border-line sm:block print:block">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-muted">
                  <tr><th className="px-4 py-3 font-semibold">#</th><th className="px-4 py-3 font-semibold">{t.receipt.paymentTime}</th><th className="px-4 py-3 font-semibold">{t.receipt.method}</th><th className="px-4 py-3 text-right font-semibold">{t.receipt.amount}</th></tr>
                </thead>
                <tbody className="divide-y divide-line/70">
                  {shown.map((item, index) => (
                    <tr key={item.id} className={item.id === payment.id ? "bg-accent-light" : ""}>
                      <td className="px-4 py-3 text-charcoal">{formatNumber(index + 1, locale)}</td>
                      <td className="px-4 py-3 text-charcoal">{formatDateTime(item.paid_at, locale)}</td>
                      <td className="px-4 py-3 text-charcoal">{formatPaymentMethod(item.method, locale, "—")}</td>
                      <td className="px-4 py-3 text-right font-semibold text-charcoal">{formatCurrency(Number(item.amount), locale)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot><tr className="border-t-2 border-line bg-stone-50"><td className="px-4 py-3 font-bold text-charcoal" colSpan={3}>{t.receipt.totalPaid}</td><td className="px-4 py-3 text-right font-bold text-charcoal">{formatCurrency(paidSoFar, locale)}</td></tr></tfoot>
              </table>
            </div>

            <ul className="space-y-3 sm:hidden print:hidden">
              {shown.map((item, index) => (
                <li key={item.id} className={`rounded-xl border p-3 ${item.id === payment.id ? "border-accent bg-accent-light" : "border-line"}`}>
                  <div className="flex items-start justify-between gap-3"><p className="text-xs font-semibold text-muted">{t.receipt.payment} {formatNumber(index + 1, locale)}</p><p className="shrink-0 font-bold text-charcoal">{formatCurrency(Number(item.amount), locale)}</p></div>
                  <p className="mt-2 text-sm text-charcoal">{formatDateTime(item.paid_at, locale)}</p>
                  <p className="mt-1 text-xs text-muted">{t.receipt.method}: {formatPaymentMethod(item.method, locale, t.common.notSpecified)}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6 divide-y divide-line/70 rounded-xl border border-line text-sm">
            <Stat label={t.receipt.monthlyFee} value={formatCurrency(fee, locale)} />
            <Stat label={t.receipt.totalPaid} value={formatCurrency(paidSoFar, locale)} />
            <Stat label={t.receipt.remainingBalance} value={remaining > 0 ? formatCurrency(remaining, locale) : t.receipt.fullyPaid} highlight={remaining > 0} />
          </section>

          <section className="mt-16 grid grid-cols-2 gap-5 text-center text-xs text-muted sm:gap-16 sm:text-sm">
            <div className="min-w-0 border-t border-stone-400 pt-2">{t.receipt.receivedBy}</div>
            <div className="min-w-0 border-t border-stone-400 pt-2">{t.receipt.authorizedSignature}</div>
          </section>

          <p className="mt-10 text-center text-xs leading-5 text-muted">{t.receipt.generated}</p>
        </div>
      </article>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0"><p className="text-xs font-medium text-muted">{label}</p><p className="mt-1 break-words text-sm font-semibold text-charcoal">{value}</p></div>;
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return <div className="flex items-center justify-between gap-3 px-4 py-3"><span className="text-muted">{label}</span><span className={`break-words text-right font-semibold ${highlight ? "text-red-700" : "text-charcoal"}`}>{value}</span></div>;
}
