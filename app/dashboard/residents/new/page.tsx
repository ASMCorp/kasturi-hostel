import Link from "next/link";
import ResidentForm from "@/components/ResidentForm";
import { addResident } from "@/app/actions";
import { getServerDictionary } from "@/lib/i18n-server";

export default function NewResidentPage() {
  const t = getServerDictionary();
  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Link href="/dashboard" className="inline-flex min-h-11 items-center text-sm font-semibold text-brand hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/20">
        ← {t.newResident.allResidents}
      </Link>
      <header className="rounded-shell bg-charcoal p-5 text-white sm:p-7">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">{t.directory.title}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{t.newResident.title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">{t.newResident.description}</p>
      </header>
      <ResidentForm action={addResident} submitLabel={t.nav.addResident} cancelHref="/dashboard" />
    </div>
  );
}
