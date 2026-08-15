"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { requireAdmin } from "@/server/authz";
import { incomeEntrySchema, type IncomeEntryInput } from "./validators";

export async function getIncomeEntries(month?: number, year?: number) {
  await requireAdmin();
  const from =
    month && year ? new Date(year, month - 1, 1) : undefined;
  const to =
    month && year ? new Date(year, month, 0, 23, 59, 59, 999) : undefined;

  return db.incomeEntry.findMany({
    where: {
      ...(from || to
        ? {
            date: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    },
    orderBy: { date: "desc" },
  });
}

export async function createIncomeEntry(input: IncomeEntryInput) {
  await requireAdmin();
  const data = incomeEntrySchema.parse(input);
  const result = await db.incomeEntry.create({
    data: {
      amount: data.amount,
      description: data.description,
      date: new Date(data.date),
    },
  });
  revalidatePath("/income");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  return result;
}

export async function deleteIncomeEntry(id: string) {
  await requireAdmin();
  const result = await db.incomeEntry.delete({ where: { id } });
  revalidatePath("/income");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  return result;
}

export async function getMonthlyIncomeTotal(year: number, month: number) {
  await requireAdmin();
  const from = new Date(year, month - 1, 1);
  const to = new Date(year, month, 0, 23, 59, 59, 999);
  const result = await db.incomeEntry.aggregate({
    where: { date: { gte: from, lte: to } },
    _sum: { amount: true },
  });
  return result._sum.amount ?? 0;
}
