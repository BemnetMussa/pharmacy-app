import { z } from "zod";

export const incomeEntrySchema = z.object({
  amount: z
    .number()
    .positive("Amount must be positive")
    .max(100_000_000, "Amount is too large"),
  description: z.string().min(1, "Description is required").max(300),
  date: z
    .string()
    .min(1, "Date is required")
    .refine((value) => !Number.isNaN(Date.parse(value)), {
      message: "Enter a valid date",
    }),
});

export type IncomeEntryInput = z.infer<typeof incomeEntrySchema>;
