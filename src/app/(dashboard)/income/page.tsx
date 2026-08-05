import { getIncomeEntries, getMonthlyIncomeTotal } from "@/features/income/actions";
import { IncomeClient } from "./income-client";

export const metadata = { title: "Income | PharmacyApp" };

export default async function IncomePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const year = params.year ? parseInt(params.year) : now.getFullYear();
  const month = params.month ? parseInt(params.month) : now.getMonth() + 1;

  const [entries, monthlyTotal] = await Promise.all([
    getIncomeEntries(month, year),
    getMonthlyIncomeTotal(year, month),
  ]);

  const monthName = new Date(year, month - 1, 1).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Income</h1>
        <p className="text-muted-foreground">
          Track all income entries for your pharmacy.
        </p>
      </div>
      <IncomeClient
        entries={entries}
        monthlyTotal={monthlyTotal}
        monthName={monthName}
        year={year}
        month={month}
      />
    </div>
  );
}
