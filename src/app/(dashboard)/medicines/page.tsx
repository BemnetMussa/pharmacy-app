import { getMedicines, getMedicineCategories } from "@/features/medicines/actions";
import { MedicinesClient } from "./medicines-client";

export const metadata = { title: "Medicines | PharmacyApp" };

export default async function MedicinesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const medicines = await getMedicines(params.q, params.category);
  const categories = await getMedicineCategories();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Medicines</h1>
          <p className="text-muted-foreground">
            Manage your medicine inventory.
          </p>
        </div>
      </div>
      <MedicinesClient
        medicines={medicines}
        categories={categories}
        searchQuery={params.q ?? ""}
        selectedCategory={params.category ?? ""}
      />
    </div>
  );
}
