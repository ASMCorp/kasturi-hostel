"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Resident, formatTaka } from "@/lib/types";
import StatusBadge from "@/components/ui/StatusBadge";

export type ResidentDirectoryRow = Resident & { paid: number };

type ResidentDirectoryProps = {
  rows: ResidentDirectoryRow[];
  initialQuery: string;
};

type PaymentStatus = "paid" | "partial" | "unpaid" | "no-fee";

function normalize(value: string) {
  return value.normalize("NFKC").trim().toLocaleLowerCase().replace(/\s+/g, " ");
}

function paymentStatus(row: ResidentDirectoryRow): PaymentStatus {
  const fee = Number(row.monthly_fee);
  if (fee <= 0) return "no-fee";
  if (row.paid <= 0) return "unpaid";
  if (row.paid < fee) return "partial";
  return "paid";
}

function dueAmount(row: ResidentDirectoryRow) {
  return Math.max(Number(row.monthly_fee) - row.paid, 0);
}

export default function ResidentDirectory({
  rows,
  initialQuery,
}: ResidentDirectoryProps) {
  const [query, setQuery] = useState(initialQuery);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredRows = useMemo(() => {
    const tokens = normalize(query).split(" ").filter(Boolean);
    if (tokens.length === 0) return rows;

    return rows.filter((row) => {
      const fields = [
        row.name,
        row.room_number,
        row.phone,
        row.school,
        row.class,
      ].map((value) => normalize(value ?? ""));

      return tokens.every((token) =>
        fields.some((field) => field.includes(token)),
      );
    });
  }, [query, rows]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const url = new URL(window.location.href);
      const trimmedQuery = query.trim();
      if (trimmedQuery) url.searchParams.set("q", trimmedQuery);
      else url.searchParams.delete("q");
      window.history.replaceState(window.history.state, "", url);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [query]);

  function clearSearch() {
    setQuery("");
    window.requestAnimationFrame(() => searchInputRef.current?.focus());
  }

  const hasSearch = normalize(query).length > 0;

  return (
    <section
      className="surface-card overflow-hidden"
      aria-labelledby="resident-directory-title"
    >
      <div className="border-b border-line px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 id="resident-directory-title" className="text-lg font-extrabold text-charcoal">
              Resident directory
            </h2>
            <p className="mt-1 text-sm text-muted" aria-live="polite" aria-atomic="true">
              Showing {filteredRows.length} of {rows.length} residents
            </p>
          </div>

          <div className="w-full lg:max-w-md">
            <label htmlFor="resident-search" className="mb-1.5 block text-sm font-semibold text-charcoal">
              Search residents
            </label>
            <div className="relative">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
              <input
                ref={searchInputRef}
                id="resident-search"
                name="q"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Name, room, phone, school or class"
                autoComplete="off"
                className="control w-full pl-11 pr-20"
              />
              {hasSearch && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-0.5 top-1/2 min-h-11 -translate-y-1/2 rounded-lg px-3 text-sm font-semibold text-brand-dark hover:bg-brand-light focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                  aria-label="Clear resident search"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="px-5 py-14 text-center">
          <p className="font-semibold text-charcoal">No residents yet</p>
          <p className="mt-1 text-sm text-muted">Add the first resident to start the directory.</p>
          <Link href="/dashboard/residents/new" className="btn-primary mt-5">
            Add resident
          </Link>
        </div>
      ) : filteredRows.length === 0 ? (
        <div className="px-5 py-14 text-center">
          <p className="font-semibold text-charcoal">No residents match this search</p>
          <p className="mt-1 text-sm text-muted">Try another name, room, phone, school or class.</p>
          <button type="button" onClick={clearSearch} className="btn-secondary mt-5">
            Clear search
          </button>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">Name</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Room</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Fee</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Paid</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                  <th scope="col" className="px-5 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {filteredRows.map((row) => {
                  const status = paymentStatus(row);
                  const due = dueAmount(row);
                  return (
                    <tr key={row.id} className="transition-colors hover:bg-brand-light/40">
                      <td className="px-5 py-4">
                        <Link
                          href={`/dashboard/residents/${row.id}`}
                          className="font-bold text-charcoal hover:text-brand-dark hover:underline"
                        >
                          {row.name}
                        </Link>
                        <div className="mt-1 text-xs text-muted">
                          {[row.school, row.class].filter(Boolean).join(" · ") || "No school details"}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-charcoal">{row.room_number || "—"}</td>
                      <td className="whitespace-nowrap px-4 py-4">{formatTaka(Number(row.monthly_fee))}</td>
                      <td className="px-4 py-4">
                        <span className="whitespace-nowrap font-semibold">{formatTaka(row.paid)}</span>
                        {due > 0 && row.paid > 0 && (
                          <span className="mt-0.5 block whitespace-nowrap text-xs text-amber-700">
                            {formatTaka(due)} due
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          <StatusBadge status={status} />
                          {!row.active && <StatusBadge status="inactive" />}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/dashboard/residents/${row.id}`}
                          className="btn-text whitespace-nowrap px-3"
                          aria-label={`Manage ${row.name}`}
                        >
                          Manage <span aria-hidden="true">→</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-line md:hidden">
            {filteredRows.map((row) => {
              const status = paymentStatus(row);
              const due = dueAmount(row);
              return (
                <article key={row.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/dashboard/residents/${row.id}`}
                        className="break-words font-bold text-charcoal hover:text-brand-dark hover:underline"
                      >
                        {row.name}
                      </Link>
                      <p className="mt-1 text-sm text-muted">
                        Room {row.room_number || "—"}
                        {row.class ? ` · Class ${row.class}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <StatusBadge status={status} />
                      {!row.active && <StatusBadge status="inactive" />}
                    </div>
                  </div>

                  <dl className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-stone-50 p-3 text-sm">
                    <div>
                      <dt className="text-xs text-muted">Monthly fee</dt>
                      <dd className="mt-1 font-semibold text-charcoal">{formatTaka(Number(row.monthly_fee))}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted">Paid</dt>
                      <dd className="mt-1 font-semibold text-charcoal">{formatTaka(row.paid)}</dd>
                    </div>
                    {due > 0 && (
                      <div className="col-span-2">
                        <dt className="text-xs text-muted">Outstanding</dt>
                        <dd className="mt-1 font-semibold text-amber-800">{formatTaka(due)}</dd>
                      </div>
                    )}
                  </dl>

                  <Link
                    href={`/dashboard/residents/${row.id}`}
                    className="btn-secondary mt-4 w-full"
                    aria-label={`Manage ${row.name}`}
                  >
                    Manage resident <span aria-hidden="true">→</span>
                  </Link>
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
