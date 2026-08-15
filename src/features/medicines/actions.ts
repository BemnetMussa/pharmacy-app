"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { requireAdmin, requireSession, getSessionRole } from "@/server/authz";
import { medicineSchema, type MedicineInput } from "./validators";

export async function getMedicines(query?: string, category?: string) {
  await requireSession();
  const role = await getSessionRole();
  const select =
    role === "ADMIN"
      ? undefined
      : {
          id: true,
          name: true,
          brandName: true,
          batchNo: true,
          category: true,
          quantity: true,
          unit: true,
          unitPrice: true,
          expiryDate: true,
          description: true,
          createdAt: true,
          updatedAt: true,
          // costPrice intentionally omitted for PHARMACIST
        };
  return db.medicine.findMany({
    where: {
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" as const } },
              { brandName: { contains: query, mode: "insensitive" as const } },
              { batchNo: { contains: query, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(category ? { category } : {}),
    },
    orderBy: { name: "asc" },
    ...(select ? { select } : {}),
  });
}

export async function getMedicineCategories() {
  await requireSession();
  const categories = await db.medicine.findMany({
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  return categories.map((c) => c.category);
}

export async function createMedicine(input: MedicineInput) {
  await requireAdmin();
  const data = medicineSchema.parse(input);
  const result = await db.medicine.create({
    data: {
      name: data.name,
      brandName: data.brandName,
      batchNo: data.batchNo,
      category: data.category,
      quantity: data.quantity,
      unit: data.unit,
      unitPrice: data.unitPrice,
      costPrice: data.costPrice,
      expiryDate: new Date(data.expiryDate),
      description: data.description ?? null,
    },
  });
  revalidatePath("/medicines");
  revalidatePath("/dashboard");
  return result;
}

export async function updateMedicine(id: string, input: MedicineInput) {
  await requireAdmin();
  const data = medicineSchema.parse(input);
  const result = await db.medicine.update({
    where: { id },
    data: {
      name: data.name,
      brandName: data.brandName,
      batchNo: data.batchNo,
      category: data.category,
      quantity: data.quantity,
      unit: data.unit,
      unitPrice: data.unitPrice,
      costPrice: data.costPrice,
      expiryDate: new Date(data.expiryDate),
      description: data.description ?? null,
    },
  });
  revalidatePath("/medicines");
  return result;
}

export async function deleteMedicine(id: string) {
  await requireAdmin();
  const result = await db.medicine.delete({ where: { id } });
  revalidatePath("/medicines");
  return result;
}

export async function getLowStockMedicines(threshold = 10) {
  await requireSession();
  return db.medicine.findMany({
    where: { quantity: { lte: threshold } },
    orderBy: { quantity: "asc" },
  });
}
