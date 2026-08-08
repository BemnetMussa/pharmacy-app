import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/server/session";
import {
  getSummaryStats,
  getDailyRevenueLast30Days,
} from "@/features/reports/queries";
import { RevenueBarChart } from "@/components/charts/charts";
import { formatMoney } from "@/lib/utils";
import type { Role } from "@/server/authz";
import { ShoppingCart, Plus } from "lucide-react";

export const metadata = { title: "Overview | leyuMed" };

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const session = await getSession();
  const role =
    (session?.user as { role?: Role } | undefined)?.role ?? "PHARMACIST";
  if (role !== "ADMIN") {
    redirect("/sales");
  }

  const [stats, dailyRevenue] = await Promise.all([
    getSummaryStats(),
    getDailyRevenueLast30Days(),
  ]);

  const firstName = session?.user.name?.split(" ")[0] ?? "there";
  const greeting = greetingForHour(new Date().getHours());

  return (
    <div className="mx-auto max-w-5xl space-y-5 md:space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">
            {greeting}, {firstName}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Here&apos;s how leyuMed is doing right now.
          </p>
        </div>
        <span className="leyu-status-ok shrink-0">Live</span>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <div className="leyu-metric-card">
          <p className="text-muted-foreground text-xs font-medium">Medicines</p>
          <p className="leyu-money mt-1 text-2xl font-bold">
            {stats.medicineCount}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">SKUs in catalog</p>
        </div>

        <div className="leyu-metric-card">
          <p className="text-muted-foreground text-xs font-medium">
            Stock on hand
          </p>
          <p className="leyu-money mt-1 text-2xl font-bold">
            {stats.stockOnHand.toLocaleString()}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">Total units</p>
        </div>

        <div className="leyu-metric-card">
          <p className="text-muted-foreground text-xs font-medium">
            Revenue · 30d
          </p>
          <p className="leyu-money mt-1 text-2xl font-bold">
            {formatMoney(stats.revenue30d)}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            From recorded sales
          </p>
        </div>

        <div
          className={
            stats.needsAttention > 0
              ? "rounded-2xl border-0 bg-amber-50 p-4 shadow-none"
              : "leyu-metric-card"
          }
        >
          <p
            className={
              stats.needsAttention > 0
                ? "text-xs font-medium text-amber-800"
                : "text-muted-foreground text-xs font-medium"
            }
          >
            Low / out of stock
          </p>
          <p
            className={
              stats.needsAttention > 0
                ? "leyu-money mt-1 text-2xl font-bold text-amber-900"
                : "leyu-money mt-1 text-2xl font-bold"
            }
          >
            {stats.needsAttention}
          </p>
          <p
            className={
              stats.needsAttention > 0
                ? "mt-1 text-xs text-amber-700"
                : "text-muted-foreground mt-1 text-xs"
            }
          >
            Needs attention
          </p>
        </div>
      </div>

      <div className="leyu-surface-card p-4 md:p-6">
        <h2 className="mb-4 text-sm font-semibold">Revenue · last 30 days</h2>
        {dailyRevenue.length === 0 ? (
          <p className="text-muted-foreground py-12 text-center text-sm">
            No sales recorded yet. Start by recording a sale.
          </p>
        ) : (
          <div className="h-[180px] md:h-[240px]">
            <RevenueBarChart data={dailyRevenue} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/sales"
          className="leyu-surface-card hover:border-primary/40 flex min-h-14 items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-colors"
        >
          <ShoppingCart className="text-primary size-4" aria-hidden />
          Record a sale
        </Link>
        <Link
          href="/medicines"
          className="leyu-surface-card hover:border-primary/40 flex min-h-14 items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-colors"
        >
          <Plus className="text-primary size-4" aria-hidden />
          Add medicine
        </Link>
      </div>

      <p className="text-muted-foreground text-center text-xs">
        Low stock is flagged in amber so problems surface quickly.
      </p>
    </div>
  );
}
