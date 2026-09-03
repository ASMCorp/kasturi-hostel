"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import type { FormActionState } from "@/app/actions";
import type { Resident } from "@/lib/types";
import SubmitButton from "@/components/ui/SubmitButton";

const initialState: FormActionState = { error: null };
const inputClass =
  "min-h-11 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-base text-charcoal outline-none transition placeholder:text-muted/70 focus:border-brand focus:ring-4 focus:ring-brand/15 disabled:bg-stone-100 sm:text-sm";

export default function ResidentForm({
  action,
  resident,
  submitLabel,
  cancelHref,
}: {
  action: (state: FormActionState, formData: FormData) => Promise<FormActionState>;
  resident?: Resident;
  submitLabel: string;
  cancelHref: string;
}) {
  const [state, formAction] = useFormState(action, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {resident && <input type="hidden" name="id" value={resident.id} />}

      <FormSection eyebrow="Personal details" title="Who is staying with us?">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="resident-name"
            label="Full name"
            name="name"
            autoComplete="name"
            defaultValue={resident?.name}
            required
          />
          <Field
            id="resident-age"
            label="Age"
            name="age"
            type="number"
            inputMode="numeric"
            min="1"
            max="120"
            defaultValue={resident?.age ?? ""}
          />
          <Field
            id="resident-phone"
            label="Phone number"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            defaultValue={resident?.phone ?? ""}
            className="sm:col-span-2"
          />
        </div>
      </FormSection>

      <FormSection eyebrow="Education" title="Study information">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="resident-class"
            label="Class"
            name="class"
            autoComplete="off"
            defaultValue={resident?.class ?? ""}
          />
          <Field
            id="resident-school"
            label="School / Institution"
            name="school"
            autoComplete="organization"
            defaultValue={resident?.school ?? ""}
          />
        </div>
      </FormSection>

      <FormSection eyebrow="Accommodation & billing" title="Room and monthly fee">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="resident-room"
            label="Room number"
            name="room_number"
            autoComplete="off"
            defaultValue={resident?.room_number ?? ""}
          />
          <Field
            id="resident-fee"
            label="Monthly fee (৳)"
            name="monthly_fee"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            defaultValue={resident?.monthly_fee ?? ""}
            required
          />
        </div>

        {resident && (
          <label
            htmlFor="resident-active"
            className="mt-5 flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-line bg-stone-50 px-3.5 py-2.5 text-sm font-medium text-charcoal"
          >
            <input
              id="resident-active"
              type="checkbox"
              name="active"
              defaultChecked={resident.active}
              className="h-5 w-5 rounded border-line text-brand focus:ring-brand"
            />
            Active resident
          </label>
        )}
      </FormSection>

      {state.error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
          {state.error}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 rounded-2xl border border-line bg-white p-4 sm:flex-row sm:items-center sm:justify-end">
        <Link
          href={cancelHref}
          className="btn-secondary px-5 py-2.5"
        >
          Cancel
        </Link>
        <SubmitButton pendingLabel={resident ? "Saving changes…" : "Adding resident…"} className="px-5 py-2.5">
          {submitLabel}
        </SubmitButton>
      </div>
    </form>
  );
}

function FormSection({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-6">
      <legend className="sr-only">{eyebrow}</legend>
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">{eyebrow}</p>
        <h2 className="mt-1 text-lg font-bold text-charcoal">{title}</h2>
      </div>
      {children}
    </fieldset>
  );
}

function Field({
  id,
  label,
  name,
  type = "text",
  defaultValue,
  required,
  step,
  min,
  max,
  inputMode,
  autoComplete,
  className = "",
}: {
  id: string;
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number;
  required?: boolean;
  step?: string;
  min?: string;
  max?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-charcoal">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        step={step}
        min={min}
        max={max}
        inputMode={inputMode}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        required={required}
        className={inputClass}
      />
    </div>
  );
}
