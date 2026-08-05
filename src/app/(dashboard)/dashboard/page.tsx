import { getSession } from "@/server/session";
import {
  getSummaryStats,
  getDailyRevenueLast30Days,
} from "@/features/reports/queries";
import { RevenueLineChart } from "@/components/charts/charts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const metadata = { title: "Dashboard | PharmacyApp" };

export default async function DashboardPage() {
  const session = await getSession();
  const [stats, dailyRevenue] = await Promise.all([
    getSummaryStats(),
    getDailyRevenueLast30Days(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session?.user.name ?? "User"}.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Total Medicines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.medicineCount}</p>
            <Link
              href="/medicines"
              className="text-primary text-xs hover:underline"
            >
              View inventory
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Today&apos;s Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ${stats.todayRevenue.toFixed(2)}
            </p>
            <Link
              href="/sales"
              className="text-primary text-xs hover:underline"
            >
              View sales
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              This Month&apos;s Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ${stats.monthlyRevenue.toFixed(2)}
            </p>
            <Link
              href="/reports"
              className="text-primary text-xs hover:underline"
            >
              View reports
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{stats.lowStock}</p>
              {stats.lowStock > 0 && (
                <Badge variant="destructive">Action needed</Badge>
              )}
            </div>
            <Link
              href="/medicines"
              className="text-primary text-xs hover:underline"
            >
              Check inventory
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* 30-day revenue chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue — Last 30 Days</CardTitle>
        </CardHeader>
        <CardContent>
          {dailyRevenue.length === 0 ? (
            <p className="text-muted-foreground py-16 text-center text-sm">
              No sales recorded yet. Start by recording a sale.
            </p>
          ) : (
            <RevenueLineChart data={dailyRevenue} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
