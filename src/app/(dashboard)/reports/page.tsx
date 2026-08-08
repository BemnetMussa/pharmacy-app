import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/server/session";
import type { Role } from "@/server/authz";
import {
  getRevenueByMonth,
  getTopMedicinesByRevenue,
  getSalesVsOtherIncome,
} from "@/features/reports/queries";
import {
  MonthlyRevenueBarChart,
  TopMedicinesBarChart,
  SalesVsOtherIncomeBarChart,
} from "@/components/charts/charts";
import { formatMoney } from "@/lib/utils";

export const metadata = { title: "Reports | leyuMed" };

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const session = await getSession();
  const role =
    (session?.user as { role?: Role } | undefined)?.role ?? "PHARMACIST";
  if (role !== "ADMIN") {
    redirect("/sales");
  }
  const params = await searchParams;
  const year = params.year
    ? parseInt(params.year)
    : new Date().getFullYear();

  const [revenueByMonth, topMedicines, salesVsIncome] = await Promise.all([
    getRevenueByMonth(year),
    getTopMedicinesByRevenue(5),
    getSalesVsOtherIncome(year),
  ]);

  const monthlyRevenueData = MONTH_NAMES.map((label, i) => {
    const row = revenueByMonth.find((r) => r.month === i + 1);
    return { month: label, revenue: row?.revenue ?? 0 };
  });

  const topMedicinesData = topMedicines.map((m) => ({
    name: m.name.split(" ")[0] ?? m.name,
    revenue: m.revenue,
  }));

  const salesVsIncomeData = MONTH_NAMES.map((label, i) => {
    const row = salesVsIncome.find((r) => r.month === i + 1);
    return {
      month: label,
      salesRevenue: row?.salesRevenue ?? 0,
      otherIncome: row?.otherIncome ?? 0,
    };
  });

  const totalRevenue = monthlyRevenueData.reduce((s, m) => s + m.revenue, 0);
  const peak = monthlyRevenueData.reduce(
    (best, m) => (m.revenue > best.revenue ? m : best),
    monthlyRevenueData[0] ?? { month: "—", revenue: 0 },
  );

  const years = [year - 1, year, year + 1].filter(
    (y) => y >= 2020 && y <= new Date().getFullYear() + 1,
  );

  return (
    <div className="mx-auto max-w-5xl space-y-5 md:space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">
            Reports
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Sales analytics for {year}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="leyu-status-ok">Live</span>
          <div className="flex gap-1">
            {years.map((y) => (
              <Link
                key={y}
                href={`/reports?year=${y}`}
                className={
                  y === year
                    ? "bg-primary text-primary-foreground rounded-full px-3 py-1 text-xs font-semibold"
                    : "bg-secondary text-muted-foreground rounded-full px-3 py-1 text-xs font-medium"
                }
              >
                {y}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="leyu-surface-card p-4 md:p-6">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-muted-foreground text-xs font-medium">
              Monthly revenue
            </p>
            <p className="leyu-money text-2xl font-bold">
              {formatMoney(totalRevenue)}
            </p>
            <p className="text-muted-foreground text-xs">
              Peak {peak.month}: {formatMoney(peak.revenue)}
            </p>
          </div>
        </div>
        <div className="h-[220px] md:h-[280px]">
          <MonthlyRevenueBarChart data={monthlyRevenueData} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="leyu-surface-card p-4 md:p-6">
          <h2 className="mb-4 text-sm font-semibold">
            Top medicines by revenue
          </h2>
          {topMedicinesData.length === 0 ? (
            <p className="text-muted-foreground py-12 text-center text-sm">
              No sales data yet.
            </p>
          ) : (
            <div className="h-[220px] md:h-[280px]">
              <TopMedicinesBarChart data={topMedicinesData} />
            </div>
          )}
        </div>

        <div className="leyu-surface-card p-4 md:p-6">
          <h2 className="mb-4 text-sm font-semibold">
            Direct sales vs other income
          </h2>
          <div className="h-[220px] md:h-[280px]">
            <SalesVsOtherIncomeBarChart data={salesVsIncomeData} />
          </div>
        </div>
      </div>
    </div>
  );
}
