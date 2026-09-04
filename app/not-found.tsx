import Link from "next/link";
import { getServerDictionary } from "@/lib/i18n-server";

export default function NotFound() {
  const t = getServerDictionary();

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-lg rounded-card border border-line bg-white p-6 text-center shadow-card sm:p-8">
        <div aria-hidden="true" className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-light text-xl font-black text-charcoal">404</div>
        <h1 className="mt-5 text-2xl font-bold text-charcoal">{t.notFound.title}</h1>
        <p className="mt-2 text-sm leading-6 text-muted">{t.notFound.description}</p>
        <Link href="/dashboard" className="btn-dark mt-6 px-5 py-2.5">
          {t.notFound.dashboard}
        </Link>
      </section>
    </main>
  );
}
