import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/server/session";
import type { Role } from "@/server/authz";
import {
  getRevenueByMonth,
  getTopMedicinesByTransactions,
  getSalesVsOtherIncome,
} from "@/features/reports/queries";
import { MonthlyRevenueBarChart } from "@/components/charts/charts";
import { cn, formatMoney } from "@/lib/utils";
import { ReportsClient } from "./reports-client";

export const metadata = { title: "Reports | leyuMed" };

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
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
  const currentYear = new Date().getFullYear();
  const parsed = params.year ? parseInt(params.year, 10) : currentYear;
  const year =
    Number.isFinite(parsed) && parsed >= 2020 && parsed <= currentYear + 1
      ? parsed
      : currentYear;

  const [revenueByMonth, topMedicines, salesVsIncome] = await Promise.all([
    getRevenueByMonth(year),
    getTopMedicinesByTransactions(5, year),
    getSalesVsOtherIncome(year),
  ]);

  const monthRows = MONTH_NAMES.map((label, i) => {
    const salesRow = revenueByMonth.find((r) => r.month === i + 1);
    const splitRow = salesVsIncome.find((r) => r.month === i + 1);
    const sales = salesRow?.revenue ?? splitRow?.salesRevenue ?? 0;
    const otherIncome = splitRow?.otherIncome ?? 0;
    return {
      month: label,
      sales,
      otherIncome,
      total: sales + otherIncome,
    };
  });

  const monthlyChartData = monthRows.map((r) => ({
    month: r.month,
    revenue: r.sales,
  }));

  const salesVsIncomeData = MONTH_NAMES.map((label, i) => {
    const row = salesVsIncome.find((r) => r.month === i + 1);
    return {
      month: label,
      salesRevenue: row?.salesRevenue ?? 0,
      otherIncome: row?.otherIncome ?? 0,
    };
  });

  const topMedicinesData = topMedicines.map((m) => ({
    name: m.name,
    transactions: m.transactions,
  }));

  const totalSales = monthRows.reduce((s, r) => s + r.sales, 0);
  const totalOther = monthRows.reduce((s, r) => s + r.otherIncome, 0);
  const combined = totalSales + totalOther;
  const peak = monthRows.reduce(
    (best, r) => (r.sales > best.sales ? r : best),
    monthRows[0] ?? { month: "—", sales: 0, otherIncome: 0, total: 0 },
  );

  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i).filter(
    (y) => y >= 2020,
  );

  const isYtd = year === currentYear;
  const periodLabel = isYtd
    ? `Year to date · ${year}`
    : `January – December ${year}`;

  return (
    <div className="mx-auto max-w-5xl space-y-5 md:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">
            Reports
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">{periodLabel}</p>
        </div>
        <div
          className="flex flex-wrap items-center gap-1.5 print:hidden"
          role="group"
          aria-label="Report year"
        >
          {yearOptions.map((y) => {
            const label =
              y === currentYear
                ? "This year"
                : y === currentYear - 1
                  ? "Last year"
                  : String(y);
            const isActive = y === year;
            return (
              <Link
                key={y}
                href={`/reports?year=${y}`}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "bg-secondary text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="leyu-metric-card">
          <p className="text-muted-foreground text-xs font-medium">
            Sales revenue
          </p>
          <p className="leyu-money mt-1 text-2xl font-bold">
            {formatMoney(totalSales)}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            Peak {peak.month}: {formatMoney(peak.sales)}
          </p>
        </div>
        <div className="leyu-metric-card">
          <p className="text-muted-foreground text-xs font-medium">
            Other income
          </p>
          <p className="leyu-money mt-1 text-2xl font-bold">
            {formatMoney(totalOther)}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            Manual income entries
          </p>
        </div>
        <div className="leyu-metric-card">
          <p className="text-muted-foreground text-xs font-medium">
            Combined total
          </p>
          <p className="leyu-money mt-1 text-2xl font-bold">
            {formatMoney(combined)}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">Sales + other</p>
        </div>
      </div>

      <div className="leyu-surface-card p-4 md:p-6">
        <h2 className="mb-4 text-sm font-semibold">
          Monthly sales revenue · {year}
        </h2>
        {totalSales === 0 ? (
          <p className="text-muted-foreground py-12 text-center text-sm">
            No sales recorded for {year} yet.
          </p>
        ) : (
          <div className="h-[180px] md:h-[240px]">
            <MonthlyRevenueBarChart data={monthlyChartData} />
          </div>
        )}
      </div>

      <ReportsClient
        year={year}
        monthRows={monthRows}
        topMedicines={topMedicinesData}
        salesVsIncome={salesVsIncomeData}
      />
    </div>
  );
}
