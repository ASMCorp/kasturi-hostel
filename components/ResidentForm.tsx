import { Resident } from "@/lib/types";

export default function ResidentForm({
  action,
  resident,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  resident?: Resident;
  submitLabel: string;
}) {
  return (
    <form action={action} className="bg-white rounded-xl border border-gray-100 p-6 space-y-4 max-w-2xl">
      {resident && <input type="hidden" name="id" value={resident.id} />}
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Full name" name="name" defaultValue={resident?.name} required />
        <Field label="Age" name="age" type="number" defaultValue={resident?.age ?? ""} />
        <Field label="Class" name="class" defaultValue={resident?.class ?? ""} />
        <Field
          label="School / Institution"
          name="school"
          defaultValue={resident?.school ?? ""}
        />
        <Field label="Phone number" name="phone" defaultValue={resident?.phone ?? ""} />
        <Field
          label="Room number"
          name="room_number"
          defaultValue={resident?.room_number ?? ""}
        />
        <Field
          label="Monthly fee (৳)"
          name="monthly_fee"
          type="number"
          step="0.01"
          defaultValue={resident?.monthly_fee ?? ""}
          required
        />
      </div>

      {resident && (
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            name="active"
            defaultChecked={resident.active}
            className="rounded border-gray-300"
          />
          Active resident
        </label>
      )}

      <div className="pt-2">
        <button className="rounded-lg bg-brand text-white px-5 py-2 text-sm font-medium hover:bg-brand-dark">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  step,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number;
  required?: boolean;
  step?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <input
        name={name}
        type={type}
        step={step}
        defaultValue={defaultValue}
        required={required}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/40"
      />
    </div>
  );
}
