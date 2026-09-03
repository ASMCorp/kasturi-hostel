"use client";

import { useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { deletePayment, type FormActionState } from "@/app/actions";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

const initialState: FormActionState = { error: null };

function TriggerButton({ onOpen }: { onOpen: () => void }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={pending}
      aria-busy={pending}
      className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-200 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? <LoadingSpinner label="Deleting payment" /> : <span aria-hidden="true">✕</span>}
      {pending ? "Deleting…" : "Delete payment"}
    </button>
  );
}

export default function DeletePaymentButton({ paymentId, residentId }: { paymentId: string; residentId: string }) {
  const [state, formAction] = useFormState(deletePayment, initialState);
  const [confirming, setConfirming] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={formAction} className="text-right">
      <input type="hidden" name="id" value={paymentId} />
      <input type="hidden" name="resident_id" value={residentId} />

      <TriggerButton onOpen={() => setConfirming(true)} />

      {state.error && <p role="alert" className="mt-1 max-w-52 text-xs font-medium text-red-700">{state.error}</p>}

      <ConfirmDialog
        open={confirming}
        tone="danger"
        title="Delete this payment?"
        message="This cannot be undone and will change the resident’s balance for the month."
        confirmLabel="Delete payment"
        cancelLabel="Keep it"
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false);
          formRef.current?.requestSubmit();
        }}
      />
    </form>
  );
}
