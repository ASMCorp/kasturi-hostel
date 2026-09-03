"use client";

import { useFormState } from "react-dom";
import { deleteResident, type FormActionState } from "@/app/actions";
import SubmitButton from "@/components/ui/SubmitButton";

const initialState: FormActionState = { error: null };

export default function DeleteResidentButton({
  residentId,
  residentName,
}: {
  residentId: string;
  residentName: string;
}) {
  const [state, formAction] = useFormState(deleteResident, initialState);

  return (
    <form
      action={formAction}
      className="space-y-2"
      onSubmit={(event) => {
        const confirmed = window.confirm(
          `Delete ${residentName}? They will be removed from the resident list. Payment history is kept and this can be restored later.`
        );
        if (!confirmed) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={residentId} />
      <SubmitButton
        pendingLabel="Deleting resident…"
        className="min-h-11 rounded-xl border border-red-300 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Delete resident
      </SubmitButton>
      {state.error && (
        <p role="alert" className="max-w-sm text-sm font-medium text-red-700">
          {state.error}
        </p>
      )}
    </form>
  );
}
