import { getMedicines, getMedicineCategories } from "@/features/medicines/actions";
import { MedicinesClient } from "./medicines-client";
import { getSession } from "@/server/session";
import type { Role } from "@/server/authz";

export const metadata = { title: "Medicines | leyuMed" };

export default async function MedicinesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const [session, medicines, categories] = await Promise.all([
    getSession(),
    getMedicines(params.q, params.category),
    getMedicineCategories(),
  ]);
  const role = ((session?.user as { role?: Role } | undefined)?.role ?? "PHARMACIST") as Role;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Medicines</h1>
          <p className="text-muted-foreground">
            {role === "ADMIN"
              ? "Manage your medicine inventory."
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
      />
    </div>
  );
}
