"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import type { FormActionState } from "@/app/actions";
import type { Resident } from "@/lib/types";
import SubmitButton from "@/components/ui/SubmitButton";
import { useLanguage } from "@/components/LanguageProvider";

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
  const { dictionary: t } = useLanguage();
  const [state, formAction] = useFormState(action, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {resident && <input type="hidden" name="id" value={resident.id} />}

      <FormSection eyebrow={t.residentForm.personalDetails} title={t.residentForm.whoStays}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="resident-name"
            label={t.residentForm.fullName}
            name="name"
            autoComplete="name"
            defaultValue={resident?.name}
            required
          />
          <Field
            id="resident-age"
            label={t.residentForm.age}
            name="age"
            type="number"
            inputMode="numeric"
            min="1"
            max="120"
            defaultValue={resident?.age ?? ""}
          />
          <Field
            id="resident-phone"
            label={t.residentForm.phone}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            defaultValue={resident?.phone ?? ""}
            className="sm:col-span-2"
          />
        </div>
      </FormSection>

      <FormSection eyebrow={t.residentForm.education} title={t.residentForm.studyInformation}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="resident-class"
            label={t.residentForm.class}
            name="class"
            autoComplete="off"
            defaultValue={resident?.class ?? ""}
          />
          <Field
            id="resident-school"
            label={t.residentForm.school}
            name="school"
            autoComplete="organization"
            defaultValue={resident?.school ?? ""}
          />
        </div>
      </FormSection>

      <FormSection eyebrow={t.residentForm.accommodation} title={t.residentForm.roomAndFee}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="resident-room"
            label={t.residentForm.roomNumber}
            name="room_number"
            autoComplete="off"
            defaultValue={resident?.room_number ?? ""}
          />
          <Field
            id="resident-fee"
            label={t.residentForm.monthlyFee}
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
            {t.residentForm.activeResident}
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
          {t.common.cancel}
        </Link>
        <SubmitButton pendingLabel={resident ? t.residentForm.saving : t.residentForm.adding} className="px-5 py-2.5">
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
