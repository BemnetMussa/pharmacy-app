import { describe, expect, it } from "vitest";
import { loginSchema, signupSchema } from "@/shared/validators/auth";
import { medicineSchema } from "@/features/medicines/validators";
import { saleSchema } from "@/features/sales/validators";
import { incomeEntrySchema } from "@/features/income/validators";

describe("loginSchema", () => {
  it("accepts a valid login", () => {
    const result = loginSchema.safeParse({
      email: "admin@leyumed.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short passwords", () => {
    const result = loginSchema.safeParse({
      email: "admin@leyumed.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });
});

describe("signupSchema", () => {
  it("accepts a valid signup with full name", () => {
    const result = signupSchema.safeParse({
      name: "Dr. Amina Bekele",
      email: "admin@leyumed.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a one-character name", () => {
    const result = signupSchema.safeParse({
      name: "A",
      email: "admin@leyumed.com",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });
});

describe("medicineSchema", () => {
  const valid = {
    name: "Amoxicillin 250mg",
    category: "Antibiotics",
    quantity: 75,
    unit: "capsule",
    unitPrice: 1.2,
    costPrice: 0.55,
    expiryDate: "2026-12-01",
    description: null,
  };

  it("accepts a valid medicine", () => {
    expect(medicineSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects negative quantity", () => {
    expect(
      medicineSchema.safeParse({ ...valid, quantity: -1 }).success,
    ).toBe(false);
  });

  it("rejects zero or negative prices", () => {
    expect(
      medicineSchema.safeParse({ ...valid, unitPrice: 0 }).success,
    ).toBe(false);
    expect(
      medicineSchema.safeParse({ ...valid, costPrice: -2 }).success,
    ).toBe(false);
  });

  it("rejects empty name", () => {
    expect(medicineSchema.safeParse({ ...valid, name: "" }).success).toBe(
      false,
    );
  });
});

describe("saleSchema", () => {
  it("accepts a valid sale", () => {
    expect(
      saleSchema.safeParse({
        medicineId: "med_123",
        quantity: 2,
        note: "walk-in",
      }).success,
    ).toBe(true);
  });

  it("rejects zero quantity", () => {
    expect(
      saleSchema.safeParse({
        medicineId: "med_123",
        quantity: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects missing medicine", () => {
    expect(
      saleSchema.safeParse({
        medicineId: "",
        quantity: 1,
      }).success,
    ).toBe(false);
  });
});

describe("incomeEntrySchema", () => {
  it("accepts a valid income entry", () => {
    expect(
      incomeEntrySchema.safeParse({
        amount: 250,
        description: "Clinic fee",
        date: "2026-08-01",
      }).success,
    ).toBe(true);
  });

  it("rejects non-positive amount", () => {
    expect(
      incomeEntrySchema.safeParse({
        amount: 0,
        description: "Clinic fee",
        date: "2026-08-01",
      }).success,
    ).toBe(false);
  });
});
