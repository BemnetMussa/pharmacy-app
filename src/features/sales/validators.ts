import { z } from "zod";

export const saleSchema = z.object({
  medicineId: z.string().min(1, "Medicine is required"),
  quantity: z
    .number()
    .int()
    .min(1, "Quantity must be at least 1")
    .max(10_000, "Quantity is too large"),
  note: z.string().max(300).optional().nullable(),
});

export type SaleInput = z.infer<typeof saleSchema>;
