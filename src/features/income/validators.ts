import { z } from "zod";

export const incomeEntrySchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  description: z.string().min(1, "Description is required").max(300),
  date: z.string().min(1, "Date is required"),
});

export type IncomeEntryInput = z.infer<typeof incomeEntrySchema>;
