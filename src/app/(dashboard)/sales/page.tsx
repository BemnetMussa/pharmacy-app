import { getSales, getTodayRevenue } from "@/features/sales/actions";
import { getMedicines } from "@/features/medicines/actions";
import { SalesClient } from "./sales-client";

export const metadata = { title: "Sales | leyuMed" };

function toDateInput(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function resolveRange(params: {
  range?: string;
  from?: string;
  to?: string;
}): { from: Date; to: Date; range: string; fromStr: string; toStr: string } {
  const now = new Date();

  if (params.from || params.to) {
    const from = params.from
      ? startOfDay(new Date(params.from))
      : startOfDay(now);
    const to = params.to
      ? endOfDay(new Date(params.to + "T12:00:00"))
      : endOfDay(now);
    return {
      from,
      to,
      range: "custom",
      fromStr: toDateInput(from),
      toStr: toDateInput(to),
    };
  }

  const range = params.range ?? "today";

  if (range === "yesterday") {
    const d = new Date(now);
    d.setDate(d.getDate() - 1);
    return {
      from: startOfDay(d),
      to: endOfDay(d),
      range,
      fromStr: toDateInput(d),
      toStr: toDateInput(d),
    };
  }

  if (range === "7d") {
    const from = new Date(now);
    from.setDate(from.getDate() - 6);
    return {
      from: startOfDay(from),
      to: endOfDay(now),
      range,
      fromStr: toDateInput(from),
      toStr: toDateInput(now),
    };
  }

  if (range === "month") {
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      from: startOfDay(from),
      to: endOfDay(now),
      range,
      fromStr: toDateInput(from),
      toStr: toDateInput(now),
    };
  }

  // today (default)
  return {
    from: startOfDay(now),
    to: endOfDay(now),
    range: "today",
    fromStr: toDateInput(now),
    toStr: toDateInput(now),
  };
}

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const { from, to, range, fromStr, toStr } = resolveRange(params);

  const [sales, medicines, todayRevenue] = await Promise.all([
    getSales(from, to),
    getMedicines(),
    getTodayRevenue(),
  ]);

  return (
    <SalesClient
      sales={sales}
      medicines={medicines}
      todayRevenue={todayRevenue}
      activeRange={range}
      from={fromStr}
      to={toStr}
    />
  );
}
