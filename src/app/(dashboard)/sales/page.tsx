import { getSales, getTodayRevenue } from "@/features/sales/actions";
import { getMedicines } from "@/features/medicines/actions";
import { SalesClient } from "./sales-client";

export const metadata = { title: "Sales | leyuMed" };

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const from = params.from ? new Date(params.from) : undefined;
  const to = params.to ? new Date(params.to + "T23:59:59") : undefined;

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
      from={params.from ?? ""}
      to={params.to ?? ""}
    />
  );
}
