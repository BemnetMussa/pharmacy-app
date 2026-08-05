import {
  getRevenueByMonth,
  getTopMedicinesByRevenue,
  getIncomeVsCost,
} from "@/features/reports/queries";
import {
  MonthlyRevenueBarChart,
  TopMedicinesPieChart,
  IncomeVsCostBarChart,
} from "@/components/charts/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Reports | PharmacyApp" };

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const params = await searchParams;
  const year = params.year
    ? parseInt(params.year)
    : new Date().getFullYear();

  const [revenueByMonth, topMedicines, incomeVsCost] = await Promise.all([
    getRevenueByMonth(year),
    getTopMedicinesByRevenue(),
    getIncomeVsCost(year),
  ]);

  const monthlyRevenueData = MONTH_NAMES.map((label, i) => {
    const row = revenueByMonth.find((r) => r.month === i + 1);
    return { month: label, revenue: row?.revenue ?? 0 };
  });

  const topMedicinesData = topMedicines.map((m) => ({
    name: m.name,
    revenue: m.revenue,
  }));

  const incomeVsCostData = MONTH_NAMES.map((label, i) => {
    const row = incomeVsCost.find((r) => r.month === i + 1);
    return {
      month: label,
      income: row?.income ?? 0,
      cost: row?.cost ?? 0,
    };
  });

  const totalRevenue = monthlyRevenueData.reduce((s, m) => s + m.revenue, 0);
  const topMed = topMedicinesData[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Sales analytics and income overview for {year}.
        </p>
      </div>

      {/* Summary row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Total Revenue ({year})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Best Selling Medicine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="truncate text-2xl font-bold">
              {topMed?.name ?? "—"}
            </p>
            <p className="text-muted-foreground text-sm">
              ${topMed?.revenue.toFixed(2) ?? "0.00"} revenue
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Medicines Tracked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{topMedicinesData.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue ({year})</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyRevenueBarChart data={monthlyRevenueData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Medicines by Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {topMedicinesData.length === 0 ? (
              <p className="text-muted-foreground py-16 text-center text-sm">
                No sales data yet.
              </p>
            ) : (
              <TopMedicinesPieChart data={topMedicinesData} />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Revenue vs Manual Income ({year})</CardTitle>
        </CardHeader>
        <CardContent>
          <IncomeVsCostBarChart data={incomeVsCostData} />
        </CardContent>
      </Card>
    </div>
  );
}
