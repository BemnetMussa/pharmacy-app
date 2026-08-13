"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatMoney, cn } from "@/lib/utils";
import { Download, Printer } from "lucide-react";
import {
  TopMedicinesBarChart,
  SalesVsOtherIncomeBarChart,
} from "@/components/charts/charts";

type MonthRow = {
  month: string;
  sales: number;
  otherIncome: number;
  total: number;
};

type TopMed = { name: string; transactions: number };

type ChartMonth = { month: string; salesRevenue: number; otherIncome: number };

export function ReportsClient({
  year,
  monthRows,
  topMedicines,
  salesVsIncome,
}: {
  year: number;
  monthRows: MonthRow[];
  topMedicines: TopMed[];
  salesVsIncome: ChartMonth[];
}) {
  const [insight, setInsight] = useState<"medicines" | "split">("medicines");

  function downloadCsv() {
    const lines: string[] = [
      `leyuMed Report,${year}`,
      "",
      "Month,Sales revenue (ETB),Other income (ETB),Total (ETB)",
      ...monthRows.map(
        (r) =>
          `${r.month},${r.sales.toFixed(2)},${r.otherIncome.toFixed(2)},${r.total.toFixed(2)}`,
      ),
      "",
      "Top medicines by transactions",
      "Medicine,Transactions",
      ...topMedicines.map((m) => `"${m.name}",${m.transactions}`),
    ];
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leyuMed-report-${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const yearSales = monthRows.reduce((s, r) => s + r.sales, 0);
  const yearOther = monthRows.reduce((s, r) => s + r.otherIncome, 0);
  const yearTotal = yearSales + yearOther;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Monthly numbers · {year}</h2>
        <div className="flex flex-wrap gap-2 print:hidden">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-xl"
            onClick={downloadCsv}
          >
            <Download className="size-4" aria-hidden />
            Export CSV
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-xl"
            onClick={() => window.print()}
          >
            <Printer className="size-4" aria-hidden />
            Print / PDF
          </Button>
        </div>
      </div>

      <div className="leyu-surface-card overflow-x-auto">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="text-muted-foreground px-4 py-3 font-medium">
                Month
              </th>
              <th className="text-muted-foreground px-4 py-3 text-right font-medium">
                Sales
              </th>
              <th className="text-muted-foreground px-4 py-3 text-right font-medium">
                Other
              </th>
              <th className="text-muted-foreground px-4 py-3 text-right font-medium">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {monthRows.map((row) => (
              <tr key={row.month} className="border-b border-border/50">
                <td className="px-4 py-2.5 font-medium">{row.month}</td>
                <td className="leyu-money px-4 py-2.5 text-right">
                  {formatMoney(row.sales)}
                </td>
                <td className="leyu-money px-4 py-2.5 text-right">
                  {formatMoney(row.otherIncome)}
                </td>
                <td className="leyu-money px-4 py-2.5 text-right font-semibold">
                  {formatMoney(row.total)}
                </td>
              </tr>
            ))}
            <tr className="bg-secondary/40">
              <td className="px-4 py-3 font-semibold">Year total</td>
              <td className="leyu-money px-4 py-3 text-right font-semibold">
                {formatMoney(yearSales)}
              </td>
              <td className="leyu-money px-4 py-3 text-right font-semibold">
                {formatMoney(yearOther)}
              </td>
              <td className="leyu-money px-4 py-3 text-right font-bold">
                {formatMoney(yearTotal)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="print:hidden">
        <div
          className="mb-3 flex gap-1.5"
          role="tablist"
          aria-label="More insights"
        >
          <button
            type="button"
            role="tab"
            aria-selected={insight === "medicines"}
            onClick={() => setInsight("medicines")}
            className={cn(
              "h-9 rounded-full border px-3 text-xs font-medium transition-colors",
              insight === "medicines"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground",
            )}
          >
            Top medicines
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={insight === "split"}
            onClick={() => setInsight("split")}
            className={cn(
              "h-9 rounded-full border px-3 text-xs font-medium transition-colors",
              insight === "split"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground",
            )}
          >
            Sales vs other
          </button>
        </div>

        <div className="leyu-surface-card p-4 md:p-6">
          {insight === "medicines" ? (
            topMedicines.length === 0 ? (
              <p className="text-muted-foreground py-10 text-center text-sm">
                No sales data for {year} yet.
              </p>
            ) : (
              <div className="space-y-4">
                <h2 className="text-sm font-semibold">
                  Top medicines by sales · {year}
                </h2>
                <p className="text-muted-foreground -mt-2 text-xs">
                  Ranked by number of sales, not money.
                </p>
                <ol className="space-y-2">
                  {topMedicines.map((m, i) => (
                    <li
                      key={m.name}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="text-muted-foreground w-5 tabular-nums">
                        {i + 1}.
                      </span>
                      <span className="min-w-0 flex-1 truncate font-medium">
                        {m.name}
                      </span>
                      <span className="shrink-0 font-semibold tabular-nums">
                        {m.transactions}{" "}
                        <span className="text-muted-foreground font-normal">
                          {m.transactions === 1 ? "sale" : "sales"}
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
                <div className="h-[200px] md:h-[240px]">
                  <TopMedicinesBarChart data={topMedicines} />
                </div>
              </div>
            )
          ) : (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold">
                Direct sales vs other income · {year}
              </h2>
              <p className="text-muted-foreground -mt-2 text-xs">
                Only months with activity are shown.
              </p>
              <div className="h-[280px] md:h-[340px]">
                <SalesVsOtherIncomeBarChart data={salesVsIncome} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
