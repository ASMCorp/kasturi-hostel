"use client";

import { deleteResident } from "@/app/actions";

export default function DeleteResidentButton({
  residentId,
  residentName,
}: {
  residentId: string;
  residentName: string;
}) {
  return (
    <form
      action={deleteResident}
      onSubmit={(e) => {
        if (
          !confirm(
            `Delete ${residentName}? This permanently removes the resident and all their payment records. This cannot be undone.`
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={residentId} />
      <button className="rounded-lg border border-red-300 text-red-600 px-3 py-1.5 text-sm hover:bg-red-50">
        Delete resident
      </button>
    </form>
  );
}
