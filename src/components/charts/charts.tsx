"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatMoney } from "@/lib/utils";

type CurrencyFormatter = (value: unknown) => [string, string];

const fmtCurrency: CurrencyFormatter = (v) => [
  formatMoney(Number(v ?? 0)),
  "Revenue",
];

const fmtLabel = (label: unknown) =>
  new Date(String(label)).toLocaleDateString("en", {
    month: "long",
    day: "numeric",
  });

const BRAND = "#1E6FD9";
const BRAND_SOFT = "#7EB0EF";
const BRAND_PALE = "#C5DAF5";

const COLORS = [BRAND, BRAND_SOFT, "#4A8DE0", BRAND_PALE, "#0F4A9A", "#A8C8F0"];

const tooltipStyle = {
  backgroundColor: "var(--card)",
  color: "var(--card-foreground)",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  fontSize: "12px",
  boxShadow: "var(--shadow-card)",
};

export function RevenueBarChart({
  data,
}: {
  data: Array<{ date: string; revenue: number }>;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E8F1FC" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "#6b7c93" }}
          tickFormatter={(v) =>
            new Date(v).toLocaleDateString("en", {
              month: "short",
              day: "numeric",
            })
          }
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
          label={{
            value: "Day",
            position: "insideBottom",
            offset: -12,
            style: { fontSize: 11, fill: "#6b7c93" },
          }}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "#6b7c93" }}
          tickFormatter={(v) => {
            const n = Number(v);
            if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
            return String(Math.round(n));
          }}
          width={48}
          axisLine={false}
          tickLine={false}
          label={{
            value: "Revenue (ETB)",
            angle: -90,
            position: "insideLeft",
            offset: 0,
            style: { fontSize: 11, fill: "#6b7c93", textAnchor: "middle" },
          }}
        />
        <Tooltip
          formatter={fmtCurrency}
          labelFormatter={fmtLabel}
          contentStyle={tooltipStyle}
          cursor={{ fill: BRAND_PALE, opacity: 0.4 }}
        />
        <Bar dataKey="revenue" fill={BRAND} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function RevenueLineChart({
  data,
}: {
  data: Array<{ date: string; revenue: number }>;
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E8F1FC" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11 }}
          tickFormatter={(v) =>
            new Date(v).toLocaleDateString("en", {
              month: "short",
              day: "numeric",
            })
          }
        />
        <YAxis
          tick={{ fontSize: 11 }}
          tickFormatter={(v) => formatMoney(Number(v))}
          width={72}
        />
        <Tooltip
          formatter={fmtCurrency}
          labelFormatter={fmtLabel}
          contentStyle={tooltipStyle}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke={BRAND}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function MonthlyRevenueBarChart({
  data,
}: {
  data: Array<{ month: string; revenue: number }>;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 4, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E8F1FC" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 10, fill: "#6b7c93" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "#6b7c93" }}
          tickFormatter={(v) => {
            const n = Number(v);
            if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
            return String(Math.round(n));
          }}
          width={36}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip formatter={fmtCurrency} contentStyle={tooltipStyle} />
        <Bar dataKey="revenue" fill={BRAND} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TopMedicinesBarChart({
  data,
}: {
  data: Array<{ name: string; transactions: number }>;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 16, left: 8, bottom: 5 }}
        barCategoryGap="20%"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#E8F1FC" horizontal={false} />
        <XAxis
          type="number"
          allowDecimals={false}
          tick={{ fontSize: 11, fill: "#6b7c93" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 11, fill: "#6b7c93" }}
          width={96}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(v) => [`${Number(v ?? 0)} sales`, "Transactions"]}
          contentStyle={tooltipStyle}
          cursor={{ fill: BRAND_PALE, opacity: 0.35 }}
        />
        <Bar
          dataKey="transactions"
          fill={BRAND}
          radius={[0, 6, 6, 0]}
          maxBarSize={28}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** @deprecated Prefer TopMedicinesBarChart for the mockup look */
export function TopMedicinesPieChart({
  data,
}: {
  data: Array<{ name: string; transactions: number }>;
}) {
  return <TopMedicinesBarChart data={data} />;
}

export function SalesVsOtherIncomeBarChart({
  data,
}: {
  data: Array<{ month: string; salesRevenue: number; otherIncome: number }>;
}) {
  // Drop empty months so sparse years don't squash 24 bars into one phone width.
  const activeMonths = data.filter(
    (d) => d.salesRevenue > 0 || d.otherIncome > 0,
  );
  const chartData = activeMonths.length > 0 ? activeMonths : data;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{ top: 8, right: 12, left: 4, bottom: 4 }}
        barCategoryGap="28%"
        barGap={6}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#E8F1FC" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: "#6b7c93" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "#6b7c93" }}
          tickFormatter={(v) => {
            const n = Number(v);
            if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
            return String(Math.round(n));
          }}
          width={40}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(v, name) => [
            formatMoney(Number(v ?? 0)),
            name === "salesRevenue" ? "Direct sales" : "Other income",
          ]}
          contentStyle={tooltipStyle}
          cursor={{ fill: BRAND_PALE, opacity: 0.35 }}
        />
        <Legend
          verticalAlign="top"
          align="right"
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, paddingBottom: 8 }}
        />
        <Bar
          dataKey="salesRevenue"
          name="Direct sales"
          fill={BRAND_SOFT}
          radius={[6, 6, 0, 0]}
          maxBarSize={36}
        />
        <Bar
          dataKey="otherIncome"
          name="Other income"
          fill={BRAND}
          radius={[6, 6, 0, 0]}
          maxBarSize={36}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** @deprecated Use SalesVsOtherIncomeBarChart */
export function IncomeVsCostBarChart({
  data,
}: {
  data: Array<{ month: string; income: number; cost: number }>;
}) {
  return (
    <SalesVsOtherIncomeBarChart
      data={data.map((d) => ({
        month: d.month,
        salesRevenue: d.income,
        otherIncome: d.cost,
      }))}
    />
  );
}

// Keep COLORS referenced so tree-shaking doesn't confuse future pie reuse
void COLORS;
