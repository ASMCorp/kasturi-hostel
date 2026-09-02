import Link from "next/link";
import { notFound } from "next/navigation";
import ResidentForm from "@/components/ResidentForm";
import { updateResident } from "@/app/actions";
import { getSupabaseAdmin } from "@/lib/supabase";
import { Resident } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditResidentPage({
  params,
}: {
  params: { id: string };
}) {
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("residents")
    .select("*")
    .eq("id", params.id)
    .single();
  if (!data) notFound();
  const resident = data as Resident;

  return (
    <div>
      <Link
        href={`/dashboard/residents/${resident.id}`}
        className="text-sm text-brand hover:underline"
      >
        ← Back
      </Link>
      <h1 className="text-2xl font-bold text-brand-dark mt-2 mb-5">
        Edit {resident.name}
      </h1>
      <ResidentForm
        action={updateResident}
        resident={resident}
        submitLabel="Save changes"
      />
    </div>
  );
}
