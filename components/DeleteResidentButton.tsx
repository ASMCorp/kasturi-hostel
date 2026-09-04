"use client";

import { useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { deleteResident, type FormActionState } from "@/app/actions";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useLanguage } from "@/components/LanguageProvider";

const initialState: FormActionState = { error: null };

function TriggerButton({ onOpen }: { onOpen: () => void }) {
  const { dictionary: t } = useLanguage();
  const { pending } = useFormStatus();
  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={pending}
      aria-busy={pending}
      className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-200 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending && <LoadingSpinner label={t.deleteResident.deletingLabel} />}
      {pending ? t.deleteResident.deleting : t.deleteResident.delete}
    </button>
  );
}

export default function DeleteResidentButton({
  residentId,
  residentName,
}: {
  residentId: string;
  residentName: string;
}) {
  const { dictionary: t } = useLanguage();
  const [state, formAction] = useFormState(deleteResident, initialState);
  const [confirming, setConfirming] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={formAction} className="space-y-2">
      <input type="hidden" name="id" value={residentId} />

      <TriggerButton onOpen={() => setConfirming(true)} />

      {state.error && (
        <p role="alert" className="max-w-sm text-sm font-medium text-red-700">
          {state.error}
        </p>
      )}

      <ConfirmDialog
        open={confirming}
        tone="danger"
        title={`${residentName} ${t.deleteResident.titleSuffix}`}
        message={t.deleteResident.message}
        confirmLabel={t.deleteResident.delete}
        cancelLabel={t.common.cancel}
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false);
          formRef.current?.requestSubmit();
        }}
      />
    </form>
  );
}
