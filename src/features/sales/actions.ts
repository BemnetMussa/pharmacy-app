"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { saleSchema, type SaleInput } from "./validators";

export async function getSales(from?: Date, to?: Date) {
  return db.sale.findMany({
    where: {
      ...(from || to
        ? {
            soldAt: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    },
    include: { medicine: { select: { name: true, unit: true } } },
    orderBy: { soldAt: "desc" },
  });
}

export async function createSale(input: SaleInput) {
  const data = saleSchema.parse(input);

  const medicine = await db.medicine.findUnique({
    where: { id: data.medicineId },
  });

  if (!medicine) throw new Error("Medicine not found");
  if (medicine.quantity < data.quantity)
    throw new Error(
      `Insufficient stock. Available: ${medicine.quantity} ${medicine.unit}`
    );

  const totalAmount = medicine.unitPrice * data.quantity;

  const [sale] = await db.$transaction([
    db.sale.create({
      data: {
        medicineId: data.medicineId,
        quantity: data.quantity,
        unitPrice: medicine.unitPrice,
        totalAmount,
        note: data.note ?? null,
      },
    }),
    db.medicine.update({
      where: { id: data.medicineId },
      data: { quantity: { decrement: data.quantity } },
    }),
  ]);

  revalidatePath("/sales");
  revalidatePath("/medicines");
  return sale;
}

export async function getTodayRevenue() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const result = await db.sale.aggregate({
    where: { soldAt: { gte: today } },
    _sum: { totalAmount: true },
  });
  return result._sum.totalAmount ?? 0;
}

export async function getMonthlyRevenue(year: number, month: number) {
  const from = new Date(year, month - 1, 1);
  const to = new Date(year, month, 0, 23, 59, 59, 999);
  const result = await db.sale.aggregate({
    where: { soldAt: { gte: from, lte: to } },
    _sum: { totalAmount: true },
  });
  return result._sum.totalAmount ?? 0;
}
