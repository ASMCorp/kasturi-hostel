export default function DashboardLoading() {
  return (
    <div role="status" aria-live="polite" aria-label="Loading dashboard content" className="space-y-5">
      <span className="sr-only">Loading dashboard content…</span>
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
