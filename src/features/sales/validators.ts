import { z } from "zod";

export const saleSchema = z.object({
  medicineId: z.string().min(1, "Medicine is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  note: z.string().max(300).optional().nullable(),
});

export type SaleInput = z.infer<typeof saleSchema>;
