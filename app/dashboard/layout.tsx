import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="no-print bg-brand text-white border-b-4 border-accent">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-full bg-accent text-brand-dark flex items-center justify-center font-bold">
              K
            </span>
            <div className="leading-tight">
              <div className="font-semibold">Kasturi Girls Hostel</div>
              <div className="text-xs text-white/70">Management System</div>
            </div>
          </Link>
          <LogoutButton />
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
