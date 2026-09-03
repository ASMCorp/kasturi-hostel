export default function DashboardLoading() {
  return (
    <div role="status" aria-live="polite" aria-label="Loading dashboard content" className="space-y-5">
      <span className="sr-only">Loading dashboard content…</span>
      <div className="h-11 w-36 animate-pulse rounded-xl bg-stone-200 motion-reduce:animate-none" />
      <div className="h-44 animate-pulse rounded-3xl bg-stone-900/90 motion-reduce:animate-none" />
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="h-64 animate-pulse rounded-2xl bg-stone-200 motion-reduce:animate-none lg:col-span-5" />
        <div className="h-64 animate-pulse rounded-2xl bg-stone-800 motion-reduce:animate-none lg:col-span-7" />
        <div className="h-80 animate-pulse rounded-2xl bg-stone-200 motion-reduce:animate-none lg:col-span-4" />
        <div className="h-80 animate-pulse rounded-2xl bg-stone-200 motion-reduce:animate-none lg:col-span-8" />
      </div>
    </div>
  );
}
