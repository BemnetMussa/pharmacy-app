import { z } from "zod";

export const medicineSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  category: z.string().min(1, "Category is required").max(100),
  quantity: z.number().int().min(0, "Quantity cannot be negative"),
  unit: z.string().min(1, "Unit is required").max(50),
  unitPrice: z.number().positive("Unit price must be positive"),
  costPrice: z.number().positive("Cost price must be positive"),
  expiryDate: z.string().optional().nullable(),
  description: z.string().max(500).optional().nullable(),
});

export type MedicineInput = z.infer<typeof medicineSchema>;
