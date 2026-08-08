"use server";

import { db } from "@/server/db";
import { requireAdmin } from "@/server/authz";

export async function getRevenueByMonth(year: number) {
  await requireAdmin();
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
  await requireAdmin();
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
  await requireAdmin();
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

/** Sales revenue vs other (manual) income entries by month. */
export async function getSalesVsOtherIncome(year: number) {
  await requireAdmin();
  const result = await db.$queryRaw<
    Array<{ month: number; salesRevenue: number; otherIncome: number }>
  >`
    SELECT
      COALESCE(s.month, i.month)::int AS month,
      COALESCE(s.revenue, 0)::float AS "salesRevenue",
      COALESCE(i.total, 0)::float AS "otherIncome"
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

/** @deprecated Use getSalesVsOtherIncome */
export async function getIncomeVsCost(year: number) {
  const rows = await getSalesVsOtherIncome(year);
  return rows.map((r) => ({
    month: r.month,
    income: r.salesRevenue,
    cost: r.otherIncome,
  }));
}

export async function getSummaryStats() {
  await requireAdmin();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const soon = new Date();
  soon.setDate(soon.getDate() + 90);
  soon.setHours(23, 59, 59, 999);

  const [
    medicineCount,
    stockAgg,
    todayRevenue,
    todaySalesCount,
    revenue30d,
    lowStock,
    outOfStock,
    expiringSoon,
    inventoryRows,
  ] = await Promise.all([
    db.medicine.count(),
    db.medicine.aggregate({ _sum: { quantity: true } }),
    getTodayRevenue(),
    db.sale.count({ where: { soldAt: { gte: todayStart } } }),
    db.sale.aggregate({
      where: { soldAt: { gte: thirtyDaysAgo } },
      _sum: { totalAmount: true },
    }),
    db.medicine.count({ where: { quantity: { gt: 0, lte: 10 } } }),
    db.medicine.count({ where: { quantity: 0 } }),
    db.medicine.count({
      where: {
        quantity: { gt: 0 },
        expiryDate: { not: null, lte: soon, gte: todayStart },
      },
    }),
    db.medicine.findMany({
      select: { quantity: true, costPrice: true },
    }),
  ]);

  const inventoryValue = inventoryRows.reduce(
    (sum, m) => sum + m.quantity * m.costPrice,
    0,
  );

  return {
    medicineCount,
    stockOnHand: stockAgg._sum.quantity ?? 0,
    todayRevenue,
    todaySalesCount,
    revenue30d: revenue30d._sum.totalAmount ?? 0,
    monthlyRevenue: await getCurrentMonthRevenue(),
    lowStock,
    outOfStock,
    needsAttention: lowStock + outOfStock,
    expiringSoon,
    inventoryValue,
  };
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
