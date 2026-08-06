"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type CurrencyFormatter = (value: unknown) => [string, string];

const etb = new Intl.NumberFormat("en-ET", {
  style: "currency",
  currency: "ETB",
  currencyDisplay: "code",
});

const fmtCurrency: CurrencyFormatter = (v) => [
  etb.format(Number(v ?? 0)),
  "Revenue",
];

const fmtLabel = (label: unknown) =>
  new Date(String(label)).toLocaleDateString("en", {
    month: "long",
    day: "numeric",
  });

const COLORS = [
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
  "#84cc16",
];

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "6px",
  fontSize: "12px",
};

export function RevenueLineChart({
  data,
}: {
  data: Array<{ date: string; revenue: number }>;
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11 }}
          tickFormatter={(v) =>
            new Date(v).toLocaleDateString("en", { month: "short", day: "numeric" })
          }
        />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => etb.format(Number(v))} />
        <Tooltip
          formatter={fmtCurrency}
          labelFormatter={fmtLabel}
          contentStyle={tooltipStyle}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#3b82f6"
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
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => etb.format(Number(v))} />
        <Tooltip formatter={fmtCurrency} contentStyle={tooltipStyle} />
        <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TopMedicinesPieChart({
  data,
}: {
  data: Array<{ name: string; revenue: number }>;
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="revenue"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label={({ name, percent }) =>
            `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
          }
          labelLine={false}
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={fmtCurrency} contentStyle={tooltipStyle} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function IncomeVsCostBarChart({
  data,
}: {
  data: Array<{ month: string; income: number; cost: number }>;
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => etb.format(Number(v))} />
        <Tooltip
          formatter={(v) => [etb.format(Number(v ?? 0)), ""]}
          contentStyle={tooltipStyle}
        />
        <Legend />
        <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} />
        <Bar dataKey="cost" fill="#f59e0b" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
