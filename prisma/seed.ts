import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { auth } from "../src/server/auth";

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ??
    "postgresql://user:password@localhost:5432/pharmacyapp",
});
const db = new PrismaClient({ adapter });

const seedUsers = [
  {
    name: "Dr. Amina",
    email: "admin@leyumed.com",
    password: "password123",
    role: "ADMIN" as const,
  },
  {
    name: "Tigist",
    email: "pharmacist@leyumed.com",
    password: "password123",
    role: "PHARMACIST" as const,
  },
];

const medicines = [
  { name: "Paracetamol 500mg", category: "Painkillers", quantity: 120, unit: "tablet", unitPrice: 0.5, costPrice: 0.2, expiryDate: new Date("2027-06-01") },
  { name: "Ibuprofen 400mg", category: "Painkillers", quantity: 85, unit: "tablet", unitPrice: 0.75, costPrice: 0.3, expiryDate: new Date("2027-03-15") },
  { name: "Amoxicillin 250mg", category: "Antibiotics", quantity: 60, unit: "capsule", unitPrice: 1.2, costPrice: 0.55, expiryDate: new Date("2026-12-01") },
  { name: "Azithromycin 500mg", category: "Antibiotics", quantity: 8, unit: "tablet", unitPrice: 2.5, costPrice: 1.1, expiryDate: new Date("2027-01-20") },
  { name: "Cetirizine 10mg", category: "Antihistamines", quantity: 200, unit: "tablet", unitPrice: 0.4, costPrice: 0.15, expiryDate: new Date("2028-02-10") },
  { name: "Omeprazole 20mg", category: "Digestive", quantity: 45, unit: "capsule", unitPrice: 1.0, costPrice: 0.4, expiryDate: new Date("2027-08-30") },
  { name: "Vitamin C 1000mg", category: "Vitamins", quantity: 150, unit: "tablet", unitPrice: 0.6, costPrice: 0.25, expiryDate: new Date("2028-05-01") },
  { name: "Cough Syrup 100ml", category: "Syrups", quantity: 5, unit: "bottle", unitPrice: 4.5, costPrice: 2.0, expiryDate: new Date("2026-10-15") },
  { name: "Insulin Glargine", category: "Diabetes", quantity: 25, unit: "vial", unitPrice: 18.0, costPrice: 11.0, expiryDate: new Date("2026-11-30") },
  { name: "Metformin 850mg", category: "Diabetes", quantity: 90, unit: "tablet", unitPrice: 0.35, costPrice: 0.12, expiryDate: new Date("2027-09-12") },
];

async function main() {
  for (const u of seedUsers) {
    const existing = await db.user.findUnique({ where: { email: u.email } });
    if (existing) {
      if (existing.role !== u.role) {
        await db.user.update({
          where: { id: existing.id },
          data: { role: u.role },
        });
      }
      continue;
    }
    const res = await auth.api.signUpEmail({
      body: { email: u.email, password: u.password, name: u.name },
    });
    await db.user.update({
      where: { id: res.user.id },
      data: { role: u.role },
    });
  }

  const created = [];
  for (const med of medicines) {
    const m = await db.medicine.create({ data: med });
    created.push(m);
  }

  const notes = ["regular customer", "prescription", null, "walk-in", null];
  let saleCount = 0;
  for (let daysAgo = 29; daysAgo >= 0; daysAgo--) {
    const salesPerDay = Math.floor(Math.random() * 4) + 1;
    for (let i = 0; i < salesPerDay; i++) {
      const med = created[Math.floor(Math.random() * created.length)];
      const qty = Math.floor(Math.random() * 5) + 1;
      const soldAt = new Date();
      soldAt.setDate(soldAt.getDate() - daysAgo);
      soldAt.setHours(9 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));
      await db.sale.create({
        data: {
          medicineId: med.id,
          quantity: qty,
          unitPrice: med.unitPrice,
          totalAmount: med.unitPrice * qty,
          soldAt,
          note: notes[Math.floor(Math.random() * notes.length)],
        },
      });
      saleCount++;
    }
  }

  const now = new Date();
  const incomeEntries = [
    { amount: 150, description: "Consultation fees", date: new Date(now.getFullYear(), now.getMonth(), 3) },
    { amount: 320, description: "Health checkup packages", date: new Date(now.getFullYear(), now.getMonth(), 8) },
    { amount: 90, description: "Blood pressure monitoring", date: new Date(now.getFullYear(), now.getMonth(), 12) },
    { amount: 200, description: "Vaccination service", date: new Date(now.getFullYear(), now.getMonth(), 15) },
    { amount: 75, description: "Medical certificates", date: new Date(now.getFullYear(), now.getMonth(), 18) },
  ];
  for (const entry of incomeEntries) {
    await db.incomeEntry.create({ data: entry });
  }

  console.log(`Seeded ${created.length} medicines, ${saleCount} sales, ${incomeEntries.length} income entries`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
