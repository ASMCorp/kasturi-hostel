"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-[55vh] max-w-xl items-center px-4 py-10">
      <section className="w-full rounded-card border border-red-200 bg-white p-6 text-center shadow-card sm:p-8">
        <div aria-hidden="true" className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-xl text-red-700">!</div>
        <h2 className="mt-4 text-xl font-bold text-charcoal">This page could not be loaded</h2>
        <p className="mt-2 text-sm leading-6 text-muted">The service may be temporarily unavailable. Your data has not been changed.</p>
        <button onClick={reset} className="btn-dark mt-5 px-5 py-2.5">
          Try again
        </button>
      </section>
    </div>
  );
}
