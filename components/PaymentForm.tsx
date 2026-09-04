"use client";

import { useFormState } from "react-dom";
import { recordPayment, type FormActionState } from "@/app/actions";
import { formatCurrency } from "@/lib/i18n";
import { useLanguage } from "@/components/LanguageProvider";
import SubmitButton from "@/components/ui/SubmitButton";

const initialState: FormActionState = { error: null };
const inputClass =
  "min-h-11 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-base text-charcoal outline-none transition placeholder:text-muted/70 focus:border-brand focus:ring-4 focus:ring-brand/15 sm:text-sm";

export default function PaymentForm({
  residentId,
  month,
  due,
}: {
  residentId: string;
  month: string;
  due: number;
}) {
  const { locale, dictionary: t } = useLanguage();
  const [state, formAction] = useFormState(recordPayment, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="resident_id" value={residentId} />
      <Field id="payment-month" label={t.paymentForm.billingMonth}>
        <input id="payment-month" type="month" name="period_month" defaultValue={month} required className={inputClass} />
      </Field>
      <Field id="payment-amount" label={`${t.paymentForm.amount}${due > 0 ? ` · ${t.paymentForm.remaining} ${formatCurrency(due, locale)}` : ""}`}>
        <input id="payment-amount" type="number" name="amount" step="0.01" min="0.01" inputMode="decimal" defaultValue={due > 0 ? due : ""} required className={inputClass} />
      </Field>
      <Field id="payment-method" label={t.paymentForm.method}>
        <input id="payment-method" name="method" autoComplete="off" placeholder={t.paymentForm.methodPlaceholder} className={inputClass} />
      </Field>
      <Field id="payment-note" label={t.paymentForm.note}>
        <input id="payment-note" name="note" autoComplete="off" className={inputClass} />
      </Field>
      {state.error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-800">
          {state.error}
        </p>
      )}
      <SubmitButton pendingLabel={t.paymentForm.saving} fullWidth className="mt-1">
        {t.paymentForm.save}
      </SubmitButton>
    </form>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-charcoal">{label}</label>
      {children}
    </div>
  );
}
