import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  Resident,
  Payment,
  currentMonth,
  monthToDate,
  formatTaka,
  formatMonth,
} from "@/lib/types";

export const dynamic = "force-dynamic";

type Row = Resident & { paid: number };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { month?: string; q?: string };
}) {
  const month = searchParams.month || currentMonth();
  const q = (searchParams.q || "").trim().toLowerCase();
  const sb = getSupabaseAdmin();

  const { data: residents } = await sb
    .from("residents")
    .select("*")
    .order("active", { ascending: false })
    .order("name", { ascending: true });

  const { data: payments } = await sb
    .from("payments")
    .select("resident_id, amount")
    .eq("period_month", monthToDate(month));

  const paidMap = new Map<string, number>();
  (payments as Pick<Payment, "resident_id" | "amount">[] | null)?.forEach((p) => {
    paidMap.set(p.resident_id, (paidMap.get(p.resident_id) || 0) + Number(p.amount));
  });

  let rows: Row[] = (residents as Resident[] | null || []).map((r) => ({
    ...r,
    paid: paidMap.get(r.id) || 0,
  }));

  if (q) {
    rows = rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.room_number || "").toLowerCase().includes(q) ||
        (r.phone || "").toLowerCase().includes(q)
    );
  }

  const totalDue = rows.reduce((s, r) => s + Number(r.monthly_fee), 0);
  const totalPaid = rows.reduce((s, r) => s + r.paid, 0);
  const fullyPaid = rows.filter((r) => r.paid >= Number(r.monthly_fee) && Number(r.monthly_fee) > 0).length;

  function statusOf(r: Row) {
    const fee = Number(r.monthly_fee);
    if (fee <= 0) return { label: "No fee set", cls: "bg-gray-100 text-gray-500" };
    if (r.paid <= 0) return { label: "Unpaid", cls: "bg-red-100 text-red-700" };
    if (r.paid < fee) return { label: "Partial", cls: "bg-amber-100 text-amber-700" };
    return { label: "Paid", cls: "bg-green-100 text-green-700" };
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Residents</h1>
          <p className="text-sm text-gray-500">
            Payment status for {formatMonth(monthToDate(month))}
          </p>
        </div>
        <Link
          href="/dashboard/residents/new"
          className="rounded-lg bg-brand text-white px-4 py-2 text-sm font-medium hover:bg-brand-dark"
        >
          + Add resident
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <Stat label="Residents" value={String(rows.length)} />
        <Stat label="Fully paid" value={`${fullyPaid}/${rows.length}`} />
        <Stat label="Collected" value={formatTaka(totalPaid)} />
        <Stat label="Expected" value={formatTaka(totalDue)} />
      </div>

      <form className="flex flex-wrap gap-2 mb-4" action="/dashboard">
        <input
          type="month"
          name="month"
          defaultValue={month}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          type="text"
          name="q"
          defaultValue={searchParams.q || ""}
          placeholder="Search name, room, phone"
          className="flex-1 min-w-[180px] rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <button className="rounded-lg bg-gray-800 text-white px-4 py-2 text-sm">
          Apply
        </button>
      </form>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Room</th>
              <th className="px-4 py-3 font-medium">Fee</th>
              <th className="px-4 py-3 font-medium">Paid</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                  No residents yet. Add the first one.
                </td>
              </tr>
            )}
            {rows.map((r) => {
              const st = statusOf(r);
              return (
                <tr key={r.id} className="border-t border-gray-50 hover:bg-brand-light/40">
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/residents/${r.id}`}
                      className="font-medium text-brand-dark hover:underline"
                    >
                      {r.name}
                    </Link>
                    {!r.active && (
                      <span className="ml-2 text-xs text-gray-400">(inactive)</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{r.room_number || "—"}</td>
                  <td className="px-4 py-3">{formatTaka(Number(r.monthly_fee))}</td>
                  <td className="px-4 py-3">
                    {formatTaka(r.paid)}
                    {r.paid > 0 && r.paid < Number(r.monthly_fee) && (
                      <span className="text-xs text-amber-600">
                        {" "}
                        (due {formatTaka(Number(r.monthly_fee) - r.paid)})
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${st.cls}`}>
                      {st.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/residents/${r.id}`}
                      className="text-brand text-sm hover:underline"
                    >
                      Manage →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-lg font-bold text-brand-dark">{value}</div>
    </div>
  );
}
