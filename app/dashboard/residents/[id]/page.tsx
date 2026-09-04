import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  type Resident,
  type Payment,
  currentMonth,
  monthToDate,
} from "@/lib/types";
import { formatCurrency, formatDate, formatMonth, formatNumber, formatPaymentMethod } from "@/lib/i18n";
import { getLocale, getServerDictionary } from "@/lib/i18n-server";
import DeleteResidentButton from "@/components/DeleteResidentButton";
import DeletePaymentButton from "@/components/DeletePaymentButton";
import PaymentForm from "@/components/PaymentForm";
import MonthNavigator from "@/components/MonthNavigator";

export const dynamic = "force-dynamic";

export default async function ResidentDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { month?: string; paid?: string };
}) {
  const locale = getLocale();
  const t = getServerDictionary();
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
  const statusLabel = status === "Paid" ? t.status.paid : status === "Partial" ? t.status.partial : status === "Unpaid" ? t.status.unpaid : t.status.noFee;
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
        ← {t.resident.allResidents}
      </Link>

      {paidJustNow && (
        <div role="status" className="rounded-2xl border border-brand/30 bg-brand-light px-4 py-3 text-sm font-semibold text-brand-dark">
          {t.resident.paymentSuccess}
        </div>
      )}

      <section className="overflow-hidden rounded-card border border-white/80 bg-gradient-to-br from-brand-light via-white to-accent-light p-5 shadow-card sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">{t.resident.profile}</p>
            <h1 className="mt-2 break-words text-3xl font-bold tracking-tight text-charcoal sm:text-4xl">{resident.name}</h1>
            <p className="mt-2 text-sm leading-6 text-muted">
              {t.resident.room} {resident.room_number || t.common.notAssigned} · {resident.class || t.resident.classNotSet}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-3 py-1.5 text-xs font-bold ${resident.active ? "border-brand/30 bg-brand-light text-brand-dark" : "border-line bg-stone-100 text-muted"}`}>
              {resident.active ? t.resident.statusActive : t.resident.statusInactive}
            </span>
            <Link
              href={`/dashboard/residents/${resident.id}/edit`}
              className="btn-dark"
            >
              {t.resident.editInformation}
            </Link>
          </div>
        </div>
      </section>

      <div className="grid min-w-0 gap-5 lg:grid-cols-12">
        <section className="surface-card p-5 lg:col-span-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">{t.resident.information}</p>
          <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5">
            <Info label={t.resident.age} value={resident.age ? formatNumber(resident.age, locale) : t.common.notProvided} />
            <Info label={t.resident.phone} value={resident.phone || t.common.notProvided} />
            <Info label={t.resident.class} value={resident.class || t.common.notProvided} />
            <Info label={t.resident.room} value={resident.room_number || t.common.notAssigned} />
            <div className="col-span-2">
              <Info label={t.resident.school} value={resident.school || t.common.notProvided} />
            </div>
          </dl>
        </section>

        <section className="surface-dark p-5 lg:col-span-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">{t.resident.monthlyBilling}</p>
              <h2 className="mt-1 text-xl font-bold">{formatMonth(monthToDate(month), locale)}</h2>
            </div>
            <MonthNavigator month={month} tone="dark" dropParams={["paid"]} />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <BillingMetric label={t.resident.monthlyFee} value={formatCurrency(fee, locale)} />
            <BillingMetric label={t.resident.paid} value={formatCurrency(paidThisMonth, locale)} />
            <div className="col-span-2 sm:col-span-1"><BillingMetric label={t.resident.remaining} value={formatCurrency(due, locale)} emphasis /></div>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
            <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${status === "Paid" ? "bg-green-200 text-green-950" : status === "Partial" ? "bg-accent text-charcoal" : status === "Unpaid" ? "bg-red-200 text-red-950" : "bg-white/15 text-white"}`}>
              {t.resident.paymentStatus} {statusLabel}
            </span>
            {latestMonthPayment && (
              <Link href={`/dashboard/receipt/${latestMonthPayment.id}`} className="btn-on-dark">
                {t.resident.printReceipt}
              </Link>
            )}
          </div>
        </section>

        <section className="surface-card p-5 lg:col-span-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">{t.resident.paymentAction}</p>
          <h2 className="mb-5 mt-1 text-xl font-bold text-charcoal">{t.resident.recordPayment}</h2>
          <PaymentForm key={month} residentId={resident.id} month={month} due={due} />
        </section>

        <section className="min-w-0 surface-card p-5 lg:col-span-7">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">{t.resident.selectedMonth}</p>
              <h2 className="mt-1 text-xl font-bold text-charcoal">{t.resident.transactions}</h2>
            </div>
            <span className="rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand-dark">{formatNumber(monthPayments.length, locale)} {t.resident.recorded}</span>
          </div>
          {monthPayments.length === 0 ? (
            <p className="mt-8 rounded-xl bg-stone-50 px-4 py-8 text-center text-sm text-muted">{t.resident.noPaymentsMonth}</p>
          ) : (
            <ul className="mt-5 divide-y divide-line/70">
              {monthPayments.map((payment) => (
                <li key={payment.id} className="flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-bold text-charcoal">{formatCurrency(Number(payment.amount), locale)}</p>
                    <p className="break-words text-xs text-muted">{formatDate(payment.paid_at, locale)} · {formatPaymentMethod(payment.method, locale, t.resident.methodNotSpecified)}</p>
                  </div>
                  <DeletePaymentButton paymentId={payment.id} residentId={resident.id} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="min-w-0 surface-card overflow-hidden">
        <div className="border-b border-line px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">{t.resident.allTransactions}</p>
          <h2 className="mt-1 text-xl font-bold text-charcoal">{t.resident.paymentHistory}</h2>
        </div>
        {payments.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted">{t.resident.noPayments}</p>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-stone-50 text-xs uppercase tracking-wide text-muted">
                  <tr><th className="px-5 py-3 font-semibold">{t.resident.month}</th><th className="px-5 py-3 font-semibold">{t.resident.amount}</th><th className="px-5 py-3 font-semibold">{t.resident.date}</th><th className="px-5 py-3 font-semibold">{t.resident.method}</th><th className="px-5 py-3 font-semibold">{t.resident.receipt}</th></tr>
                </thead>
                <tbody className="divide-y divide-line/70">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="transition-colors hover:bg-brand-light/40">
                      <td className="px-5 py-3 font-medium text-charcoal">{formatMonth(payment.period_month, locale)}</td>
                      <td className="px-5 py-3 text-charcoal">{formatCurrency(Number(payment.amount), locale)}</td>
                      <td className="px-5 py-3 text-muted">{formatDate(payment.paid_at, locale)}</td>
                      <td className="px-5 py-3 text-muted">{formatPaymentMethod(payment.method, locale, "—")}</td>
                      <td className="px-5 py-3">{latestPaymentIdByMonth.get(payment.period_month) === payment.id ? <ReceiptLink id={payment.id} label={t.resident.viewReceipt} /> : <span className="text-line">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="divide-y divide-line/70 md:hidden">
              {payments.map((payment) => (
                <li key={payment.id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0"><p className="font-bold text-charcoal">{formatMonth(payment.period_month, locale)}</p><p className="mt-1 text-xs text-muted">{formatDate(payment.paid_at, locale)} · {formatPaymentMethod(payment.method, locale, t.resident.methodNotSpecified)}</p></div>
                    <p className="shrink-0 font-bold text-charcoal">{formatCurrency(Number(payment.amount), locale)}</p>
                  </div>
                  {latestPaymentIdByMonth.get(payment.period_month) === payment.id && <ReceiptLink id={payment.id} label={t.resident.viewReceipt} />}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="rounded-card border border-red-200 bg-red-50/60 p-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-700">{t.resident.destructiveControls}</p>
        <h2 className="mt-1 text-lg font-bold text-charcoal">{t.resident.removeResident}</h2>
        <p className="mb-4 mt-1 text-sm text-muted">{t.resident.removeDescription}</p>
        <DeleteResidentButton residentId={resident.id} residentName={resident.name} />
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0"><dt className="text-xs font-medium text-muted">{label}</dt><dd className="mt-1 break-words text-sm font-semibold text-charcoal">{value}</dd></div>;
}

function BillingMetric({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return <div className={`rounded-xl border p-3 ${emphasis ? "border-accent/40 bg-accent/10" : "surface-dark-nested"}`}><p className={`text-xs ${emphasis ? "text-accent/90" : "text-white/60"}`}>{label}</p><p className={`mt-1 break-words text-lg font-bold ${emphasis ? "text-accent" : "text-white"}`}>{value}</p></div>;
}

function ReceiptLink({ id, label }: { id: string; label: string }) {
  return <Link href={`/dashboard/receipt/${id}`} className="inline-flex min-h-11 items-center text-sm font-semibold text-brand hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/20">{label}</Link>;
}
