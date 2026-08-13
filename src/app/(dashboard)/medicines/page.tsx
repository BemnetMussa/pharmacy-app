import { getMedicines, getMedicineCategories } from "@/features/medicines/actions";
import { MedicinesClient } from "./medicines-client";
import { getSession } from "@/server/session";
import type { Role } from "@/server/authz";

export const metadata = { title: "Medicines | leyuMed" };

export default async function MedicinesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    stock?: string;
    action?: string;
  }>;
}) {
  const params = await searchParams;
  const [session, medicines, categories] = await Promise.all([
    getSession(),
    // Load full (or category) list so search can filter instantly client-side
    getMedicines(undefined, params.category),
    getMedicineCategories(),
  ]);
  const role = ((session?.user as { role?: Role } | undefined)?.role ??
    "PHARMACIST") as Role;

  const stockFilter =
    params.stock === "attention" || params.stock === "expiring"
      ? params.stock
      : undefined;

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">
            Medicines
          </h1>
          <p className="text-muted-foreground text-sm">
            {stockFilter === "attention"
              ? "Showing low and out-of-stock medicines."
              : stockFilter === "expiring"
                ? "Showing medicines expiring within 90 days."
                : role === "ADMIN"
                  ? "Manage inventory, prices, and stock levels."
                  : "Browse stock and selling prices."}
          </p>
        </div>
      </div>
      <MedicinesClient
        medicines={medicines}
        categories={categories}
        searchQuery={params.q ?? ""}
        selectedCategory={params.category ?? ""}
        role={role}
        initialStockFilter={stockFilter}
        openAddOnMount={params.action === "add" && role === "ADMIN"}
      />
    </div>
  );
}
