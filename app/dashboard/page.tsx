import { getSupabaseAdmin } from "@/lib/supabase";
import {
  Resident,
  Payment,
  currentMonth,
  monthToDate,
  formatTaka,
  formatMonth,
} from "@/lib/types";
import MonthNavigator from "@/components/MonthNavigator";
import ResidentDirectory, {
  ResidentDirectoryRow,
} from "@/components/ResidentDirectory";
import MetricCard from "@/components/ui/MetricCard";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { month?: string; q?: string };
}) {
  const month = /^[1-9]\d{3}-(0[1-9]|1[0-2])$/.test(searchParams.month || "")
    ? searchParams.month!
    : currentMonth();
  const initialQuery = searchParams.q || "";
  const sb = getSupabaseAdmin();

  const [residentsResult, paymentsResult] = await Promise.all([
    sb
      .from("residents")
      .select("*")
      .is("deleted_at", null)
      .order("active", { ascending: false })
      .order("name", { ascending: true }),
    sb
      .from("payments")
      .select("resident_id, amount")
      .eq("period_month", monthToDate(month)),
  ]);

  if (residentsResult.error) {
    throw new Error(`Unable to load residents: ${residentsResult.error.message}`);
  }
  if (paymentsResult.error) {
    throw new Error(`Unable to load payments: ${paymentsResult.error.message}`);
  }

  const paidMap = new Map<string, number>();
  (
    paymentsResult.data as Pick<Payment, "resident_id" | "amount">[] | null
  )?.forEach((payment) => {
    paidMap.set(
      payment.resident_id,
      (paidMap.get(payment.resident_id) || 0) + Number(payment.amount),
    );
  });

  const rows: ResidentDirectoryRow[] = (
    (residentsResult.data as Resident[] | null) || []
  ).map((resident) => ({
    ...resident,
    paid: paidMap.get(resident.id) || 0,
  }));

  const totalExpected = rows.reduce(
    (sum, resident) => sum + Number(resident.monthly_fee),
    0,
  );
  const totalCollected = rows.reduce(
    (sum, resident) => sum + resident.paid,
    0,
  );
  const fullyPaid = rows.filter((resident) => {
    const fee = Number(resident.monthly_fee);
    return fee > 0 && resident.paid >= fee;
  }).length;
  const outstanding = Math.max(totalExpected - totalCollected, 0);
  const collectionPercentage =
    totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;
  const roundedPercentage = Math.round(collectionPercentage);
  const progressWidth = Math.min(Math.max(collectionPercentage, 0), 100);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
            Hostel overview
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-charcoal sm:text-4xl">
            Residents
          </h1>
          <p className="mt-2 text-sm text-muted sm:text-base">
            Payment status for {formatMonth(monthToDate(month))}
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
            Billing month
          </p>
          <MonthNavigator month={month} tone="light" />
        </div>
      </div>

      <section aria-label="Monthly payment summary" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Collected"
          value={formatTaka(totalCollected)}
          detail={`${roundedPercentage}% of expected fees`}
          variant="dark"
          className="sm:col-span-2 lg:row-span-2"
          valueClassName="text-4xl sm:text-5xl lg:mt-6 lg:text-6xl"
        >
          <div className="mt-7 lg:mt-12">
            <div className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold text-white/70">
              <span>Collection progress</span>
              <span>{roundedPercentage}%</span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-white/15"
              role="progressbar"
              aria-label="Monthly collection progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.min(Math.max(roundedPercentage, 0), 100)}
            >
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${progressWidth}%` }}
              />
            </div>
          </div>
        </MetricCard>

        <MetricCard
          label="Residents"
          value={String(rows.length)}
          detail="Total resident records"
        />
        <MetricCard
          label="Fully paid"
          value={`${fullyPaid}/${rows.length}`}
          detail="Residents settled this month"
          variant="accent"
        />
        <MetricCard
          label="Expected"
          value={formatTaka(totalExpected)}
          detail="Total monthly fees"
        />
        <MetricCard
          label="Outstanding"
          value={formatTaka(outstanding)}
          detail={outstanding > 0 ? "Still to collect" : "Nothing outstanding"}
        />
      </section>

      <ResidentDirectory rows={rows} initialQuery={initialQuery} />
    </div>
  );
}
