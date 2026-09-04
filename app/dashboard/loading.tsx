import { getServerDictionary } from "@/lib/i18n-server";

export default function DashboardLoading() {
  const t = getServerDictionary();
  return (
    <div role="status" aria-live="polite" aria-label={t.common.loading} className="space-y-5">
      <span className="sr-only">{t.common.loading}</span>
      <div className="h-11 w-36 animate-pulse rounded-xl bg-line motion-reduce:animate-none" />
      <div className="h-44 animate-pulse rounded-card bg-charcoal/85 motion-reduce:animate-none" />
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="h-64 animate-pulse rounded-card bg-line motion-reduce:animate-none lg:col-span-5" />
        <div className="h-64 animate-pulse rounded-card bg-charcoal/80 motion-reduce:animate-none lg:col-span-7" />
        <div className="h-80 animate-pulse rounded-card bg-line motion-reduce:animate-none lg:col-span-4" />
        <div className="h-80 animate-pulse rounded-card bg-line motion-reduce:animate-none lg:col-span-8" />
      </div>
    </div>
  );
}
