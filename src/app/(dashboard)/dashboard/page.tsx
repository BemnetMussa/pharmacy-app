import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/server/session";
import {
  getSummaryStats,
  getDailyRevenueLast30Days,
} from "@/features/reports/queries";
import { RevenueBarChart } from "@/components/charts/charts";
import { cn, formatMoney } from "@/lib/utils";
import type { Role } from "@/server/authz";
import { ShoppingCart, Plus, ArrowRight } from "lucide-react";

export const metadata = { title: "Overview | leyuMed" };

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function MetricCard({
  label,
  value,
  hint,
  href,
  tone = "default",
}: {
  label: string;
  value: string;
  hint: string;
  href?: string;
  tone?: "default" | "warning" | "danger";
}) {
  const className = cn(
    "block rounded-2xl border-0 p-4 shadow-none transition-colors",
    tone === "default" && "bg-secondary",
    tone === "warning" &&
      "bg-amber-50 hover:bg-amber-100/80 dark:bg-amber-500/10 dark:hover:bg-amber-500/15",
    tone === "danger" &&
      "bg-red-50 hover:bg-red-100/80 dark:bg-red-500/10 dark:hover:bg-red-500/15",
    href && "cursor-pointer",
  );

  const labelClass =
    tone === "warning"
      ? "text-xs font-medium text-amber-800 dark:text-amber-200"
      : tone === "danger"
        ? "text-xs font-medium text-red-800 dark:text-red-200"
        : "text-muted-foreground text-xs font-medium";

  const valueClass =
    tone === "warning"
      ? "leyu-money mt-1 text-2xl font-bold text-amber-900 dark:text-amber-50"
      : tone === "danger"
        ? "leyu-money mt-1 text-2xl font-bold text-red-900 dark:text-red-50"
        : "leyu-money mt-1 text-2xl font-bold";

  const hintClass =
    tone === "warning"
      ? "mt-1 text-xs text-amber-700 dark:text-amber-200/80"
      : tone === "danger"
        ? "mt-1 text-xs text-red-700 dark:text-red-200/80"
        : "text-muted-foreground mt-1 text-xs";

  const body = (
    <>
      <p className={labelClass}>{label}</p>
      <p className={valueClass}>{value}</p>
      <p className={cn(hintClass, "flex items-center gap-1")}>
        {hint}
        {href ? <ArrowRight className="size-3 shrink-0" aria-hidden /> : null}
      </p>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {body}
      </Link>
    );
  }

  return <div className={className}>{body}</div>;
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
  const attentionTone =
    stats.outOfStock > 0
      ? "danger"
      : stats.needsAttention > 0
        ? "warning"
        : "default";

  return (
    <div className="mx-auto max-w-5xl space-y-5 md:space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight md:text-2xl">
          {greeting}, {firstName}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Today&apos;s sales and what needs attention.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <MetricCard
          label="Today's sales"
          value={formatMoney(stats.todayRevenue)}
          hint={`${stats.todaySalesCount} sale${stats.todaySalesCount === 1 ? "" : "s"} today`}
          href="/sales"
        />
        <MetricCard
          label="This month"
          value={formatMoney(stats.monthlyRevenue)}
          hint="Revenue so far"
          href="/reports"
        />
        <MetricCard
          label="Low / out of stock"
          value={String(stats.needsAttention)}
          hint={
            stats.needsAttention > 0
              ? `${stats.lowStock} low · ${stats.outOfStock} out · review`
              : "All looking healthy"
          }
          href="/medicines?stock=attention"
          tone={attentionTone}
        />
        <MetricCard
          label="Expiring soon"
          value={String(stats.expiringSoon)}
          hint={
            stats.expiringSoon > 0
              ? "Within 90 days · check"
              : "None in next 90 days"
          }
          href="/medicines?stock=expiring"
          tone={stats.expiringSoon > 0 ? "warning" : "default"}
        />
      </div>

      <div className="leyu-surface-card p-4 md:p-6">
        <div className="mb-1 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">Revenue · last 30 days</h2>
          <Link
            href="/reports"
            className="text-primary inline-flex items-center gap-1 text-xs font-medium hover:underline"
          >
            Full reports
            <ArrowRight className="size-3" aria-hidden />
          </Link>
        </div>
        <p className="text-muted-foreground mb-4 text-xs">
          Up = money earned (ETB) · across = each day
        </p>
        {dailyRevenue.length === 0 ? (
          <p className="text-muted-foreground py-12 text-center text-sm">
            No sales recorded yet. Start by recording a sale.
          </p>
        ) : (
          <div className="h-[200px] md:h-[260px]">
            <RevenueBarChart data={dailyRevenue} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          href="/sales"
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold shadow-sm transition-colors"
        >
          <ShoppingCart className="size-4" aria-hidden />
          Record a sale
        </Link>
        <Link
          href="/medicines?action=add"
          className="border-primary/30 text-primary hover:bg-primary/5 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border bg-card px-4 text-sm font-semibold transition-colors"
        >
          <Plus className="size-4" aria-hidden />
          Add medicine
        </Link>
      </div>
    </div>
  );
}
