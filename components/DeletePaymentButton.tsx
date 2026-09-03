"use client";

import { useFormState } from "react-dom";
import { deletePayment, type FormActionState } from "@/app/actions";
import SubmitButton from "@/components/ui/SubmitButton";

const initialState: FormActionState = { error: null };

export default function DeletePaymentButton({ paymentId, residentId }: { paymentId: string; residentId: string }) {
  const [state, formAction] = useFormState(deletePayment, initialState);

  return (
    <form
      action={formAction}
      className="text-right"
      onSubmit={(event) => {
        if (!window.confirm("Delete this payment? This cannot be undone and will change the resident’s balance.")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={paymentId} />
      <input type="hidden" name="resident_id" value={residentId} />
      <SubmitButton variant="none" size="none" pendingLabel="Deleting…" className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-200 disabled:cursor-not-allowed disabled:opacity-60">
        <span aria-hidden="true">✕</span>
        Delete payment
      </SubmitButton>
      {state.error && <p role="alert" className="mt-1 max-w-52 text-xs font-medium text-red-700">{state.error}</p>}
    </form>
  );
}
