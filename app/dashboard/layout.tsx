import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getServerDictionary } from "@/lib/i18n-server";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = getServerDictionary();

  return (
    <div className="min-h-screen sm:p-4">
      <div className="app-shell max-w-7xl">
        <header className="no-print border-b border-line/80 bg-surface/90 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3 sm:gap-5">
              <Link
                href="/dashboard"
                className="flex min-h-11 min-w-0 items-center gap-2 rounded-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-brand/25"
                aria-label={t.nav.dashboardLabel}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand font-extrabold text-white shadow-sm ring-2 ring-accent">
                  K
                </span>
                <span className="min-w-0 leading-tight">
                  <span className="block truncate text-sm font-extrabold text-charcoal sm:text-base">
                    {t.common.hostelName}
                  </span>
                  <span className="hidden text-xs text-muted sm:block">{t.common.managementSystem}</span>
                </span>
              </Link>

              <nav aria-label={t.nav.mainNavigation} className="hidden sm:block">
                <Link
                  href="/dashboard"
                  aria-current="page"
                  className="inline-flex min-h-11 items-center rounded-full bg-charcoal px-4 text-sm font-semibold text-white"
                >
                  {t.common.dashboard}
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <LanguageSwitcher compact />
              <Link href="/dashboard/residents/new" className="btn-text whitespace-nowrap">
                <span aria-hidden="true">+</span>
                <span className="hidden min-[400px]:inline">{t.nav.addResident}</span>
                <span className="min-[400px]:hidden">{t.nav.add}</span>
              </Link>
              <LogoutButton />
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
