"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { medicineSchema, type MedicineInput } from "./validators";

export async function getMedicines(query?: string, category?: string) {
  return db.medicine.findMany({
    where: {
      ...(query
        ? {
            name: {
              contains: query,
              mode: "insensitive" as const,
            },
          }
        : {}),
      ...(category ? { category } : {}),
    },
    orderBy: { name: "asc" },
  });
}

export async function getMedicineCategories() {
  const categories = await db.medicine.findMany({
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  return categories.map((c) => c.category);
}

export async function createMedicine(input: MedicineInput) {
  const data = medicineSchema.parse(input);
  return db.medicine.create({
    data: {
      name: data.name,
      category: data.category,
      quantity: data.quantity,
      unit: data.unit,
      unitPrice: data.unitPrice,
      costPrice: data.costPrice,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      description: data.description ?? null,
    },
  });
}

export async function updateMedicine(id: string, input: MedicineInput) {
  const data = medicineSchema.parse(input);
  const result = await db.medicine.update({
    where: { id },
    data: {
      name: data.name,
      category: data.category,
      quantity: data.quantity,
      unit: data.unit,
      unitPrice: data.unitPrice,
      costPrice: data.costPrice,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      description: data.description ?? null,
    },
  });
  revalidatePath("/medicines");
  return result;
}

export async function deleteMedicine(id: string) {
  const result = await db.medicine.delete({ where: { id } });
  revalidatePath("/medicines");
  return result;
}

export async function getLowStockMedicines(threshold = 10) {
  return db.medicine.findMany({
    where: { quantity: { lte: threshold } },
    orderBy: { quantity: "asc" },
  });
}
