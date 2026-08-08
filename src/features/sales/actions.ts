"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { requireSession } from "@/server/authz";
import { saleSchema, type SaleInput } from "./validators";
import { AppError } from "@/shared/utils/errors";

export async function getSales(from?: Date, to?: Date) {
  await requireSession();
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
  await requireSession();
  const data = saleSchema.parse(input);

  const sale = await db.$transaction(async (tx) => {
    const medicine = await tx.medicine.findUnique({
      where: { id: data.medicineId },
    });

    if (!medicine) {
      throw new AppError("Medicine not found", 404, "MEDICINE_NOT_FOUND");
    }

    const updated = await tx.medicine.updateMany({
      where: {
        id: data.medicineId,
        quantity: { gte: data.quantity },
      },
      data: { quantity: { decrement: data.quantity } },
    });

    if (updated.count === 0) {
      throw new AppError(
        `Insufficient stock. Available: ${medicine.quantity} ${medicine.unit}`,
        400,
        "INSUFFICIENT_STOCK",
      );
    }

    const totalAmount = medicine.unitPrice * data.quantity;

    return tx.sale.create({
      data: {
        medicineId: data.medicineId,
        quantity: data.quantity,
        unitPrice: medicine.unitPrice,
        totalAmount,
        note: data.note ?? null,
      },
    });
  });

  revalidatePath("/sales");
  revalidatePath("/medicines");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  return sale;
}

export async function getTodayRevenue() {
  await requireSession();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const result = await db.sale.aggregate({
    where: { soldAt: { gte: today } },
    _sum: { totalAmount: true },
  });
  return result._sum.totalAmount ?? 0;
}

export async function getMonthlyRevenue(year: number, month: number) {
  await requireSession();
  const from = new Date(year, month - 1, 1);
  const to = new Date(year, month, 0, 23, 59, 59, 999);
  const result = await db.sale.aggregate({
    where: { soldAt: { gte: from, lte: to } },
    _sum: { totalAmount: true },
  });
  return result._sum.totalAmount ?? 0;
}
