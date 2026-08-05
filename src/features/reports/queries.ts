"use server";

import { db } from "@/server/db";

export async function getRevenueByMonth(year: number) {
  const result = await db.$queryRaw<
    Array<{ month: number; revenue: number }>
  >`
    SELECT
      EXTRACT(MONTH FROM "soldAt")::int AS month,
      SUM("totalAmount")::float AS revenue
    FROM "Sale"
    WHERE EXTRACT(YEAR FROM "soldAt") = ${year}
    GROUP BY month
    ORDER BY month
  `;
  return result;
}

export async function getDailyRevenueLast30Days() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const result = await db.$queryRaw<
    Array<{ date: string; revenue: number }>
  >`
    SELECT
      DATE("soldAt")::text AS date,
      SUM("totalAmount")::float AS revenue
    FROM "Sale"
    WHERE "soldAt" >= ${thirtyDaysAgo}
    GROUP BY DATE("soldAt")
    ORDER BY DATE("soldAt")
  `;
  return result;
}

export async function getTopMedicinesByRevenue(limit = 8) {
  const result = await db.$queryRaw<
    Array<{ name: string; revenue: number; quantity: number }>
  >`
    SELECT
      m.name,
      SUM(s."totalAmount")::float AS revenue,
      SUM(s.quantity)::int AS quantity
    FROM "Sale" s
    JOIN "Medicine" m ON m.id = s."medicineId"
    GROUP BY m.name
    ORDER BY revenue DESC
    LIMIT ${limit}
  `;
  return result;
}

export async function getIncomeVsCost(year: number) {
  const result = await db.$queryRaw<
    Array<{ month: number; income: number; cost: number }>
  >`
    SELECT
      COALESCE(s.month, i.month)::int AS month,
      COALESCE(s.revenue, 0)::float AS income,
      COALESCE(i.total, 0)::float AS cost
    FROM (
      SELECT EXTRACT(MONTH FROM "soldAt")::int AS month,
             SUM("totalAmount") AS revenue
      FROM "Sale"
      WHERE EXTRACT(YEAR FROM "soldAt") = ${year}
      GROUP BY month
    ) s
    FULL OUTER JOIN (
      SELECT EXTRACT(MONTH FROM "date")::int AS month,
             SUM("amount") AS total
      FROM "IncomeEntry"
      WHERE EXTRACT(YEAR FROM "date") = ${year}
      GROUP BY month
    ) i ON s.month = i.month
    ORDER BY month
  `;
  return result;
}

export async function getSummaryStats() {
  const [medicineCount, todayRevenue, monthlyRevenue, lowStock] =
    await Promise.all([
      db.medicine.count(),
      getTodayRevenue(),
      getCurrentMonthRevenue(),
      db.medicine.count({ where: { quantity: { lte: 10 } } }),
    ]);

  return { medicineCount, todayRevenue, monthlyRevenue, lowStock };
}

async function getTodayRevenue() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const result = await db.sale.aggregate({
    where: { soldAt: { gte: today } },
    _sum: { totalAmount: true },
  });
  return result._sum.totalAmount ?? 0;
}

async function getCurrentMonthRevenue() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const result = await db.sale.aggregate({
    where: { soldAt: { gte: from, lte: to } },
    _sum: { totalAmount: true },
  });
  return result._sum.totalAmount ?? 0;
}
