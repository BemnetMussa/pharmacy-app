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
  backgroundColor: "white",
  border: "1px solid #E8F1FC",
  borderRadius: "12px",
  fontSize: "12px",
  boxShadow: "0 1px 3px rgb(30 111 217 / 0.08)",
};

export function RevenueBarChart({
  data,
}: {
  data: Array<{ date: string; revenue: number }>;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "#6b7c93" }}
          tickFormatter={(v) =>
            new Date(v).toLocaleDateString("en", { day: "numeric" })
          }
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis hide />
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
      <BarChart data={data} margin={{ top: 5, right: 8, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E8F1FC" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
        <YAxis
          tick={{ fontSize: 11 }}
          tickFormatter={(v) => formatMoney(Number(v))}
          width={72}
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
  data: Array<{ name: string; revenue: number }>;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 16, left: 8, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#E8F1FC" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 11 }}
          tickFormatter={(v) => formatMoney(Number(v))}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 11 }}
          width={90}
        />
        <Tooltip formatter={fmtCurrency} contentStyle={tooltipStyle} />
        <Bar dataKey="revenue" fill={BRAND} radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** @deprecated Prefer TopMedicinesBarChart for the mockup look */
export function TopMedicinesPieChart({
  data,
}: {
  data: Array<{ name: string; revenue: number }>;
}) {
  return <TopMedicinesBarChart data={data} />;
}

export function SalesVsOtherIncomeBarChart({
  data,
}: {
  data: Array<{ month: string; salesRevenue: number; otherIncome: number }>;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 8, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E8F1FC" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
        <YAxis
          tick={{ fontSize: 11 }}
          tickFormatter={(v) => formatMoney(Number(v))}
          width={72}
        />
        <Tooltip
          formatter={(v) => [formatMoney(Number(v ?? 0)), ""]}
          contentStyle={tooltipStyle}
        />
        <Legend />
        <Bar
          dataKey="salesRevenue"
          name="Direct sales"
          fill={BRAND_SOFT}
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="otherIncome"
          name="Other income"
          fill={BRAND}
          radius={[4, 4, 0, 0]}
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
