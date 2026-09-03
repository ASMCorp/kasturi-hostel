import Link from "next/link";
import { notFound } from "next/navigation";
import ResidentForm from "@/components/ResidentForm";
import { updateResident } from "@/app/actions";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { Resident } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditResidentPage({ params }: { params: { id: string } }) {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.from("residents").select("*").eq("id", params.id).single();

  if (error) {
    if (error.code === "PGRST116") notFound();
    throw new Error("Unable to load this resident for editing right now.");
  }
  if (!data) notFound();
  const resident = data as Resident;
  if (resident.deleted_at) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Link href={`/dashboard/residents/${resident.id}`} className="inline-flex min-h-11 items-center text-sm font-semibold text-brand hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/20">
        ← Back to resident
      </Link>
      <header className="rounded-3xl bg-stone-900 p-5 text-white sm:p-7">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-300">Resident profile</p>
        <h1 className="mt-2 break-words text-3xl font-bold tracking-tight">Edit {resident.name}</h1>
        <p className="mt-2 text-sm leading-6 text-stone-300">Update personal, education, accommodation, and billing information.</p>
      </header>
      <ResidentForm action={updateResident} resident={resident} submitLabel="Save changes" cancelHref={`/dashboard/residents/${resident.id}`} />
    </div>
  );
}
