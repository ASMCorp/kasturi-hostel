import Link from "next/link";
import ResidentForm from "@/components/ResidentForm";
import { addResident } from "@/app/actions";

export default function NewResidentPage() {
  return (
    <div>
      <Link href="/dashboard" className="text-sm text-brand hover:underline">
        ← Back
      </Link>
      <h1 className="text-2xl font-bold text-brand-dark mt-2 mb-5">
        Add resident
      </h1>
      <ResidentForm action={addResident} submitLabel="Add resident" />
    </div>
  );
}
