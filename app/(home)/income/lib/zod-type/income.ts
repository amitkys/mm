import { z } from "zod";
import {
  incomeTypeEnum,
  incomeSourceEnum,
  incomeDepositedToEnum,
} from "@/db/schema/export";

export const createIncomeSchema = z.object({
  date: z.date({ error: "Date is required" }),
  type: z.enum(incomeTypeEnum.enumValues),
  source: z.enum(incomeSourceEnum.enumValues),
  amount: z
    .string()
    .min(1, { error: "Amount is required" })
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Amount must be a positive number",
    }),
  depositedTo: z.enum(incomeDepositedToEnum.enumValues),
  description: z.string().trim().nullable().optional(),
  notes: z.string().trim().nullable().optional(),
});

export type CreateIncomeSchema = z.infer<typeof createIncomeSchema>;

export const updateIncomeSchema = createIncomeSchema.partial();

export type UpdateIncomeSchema = z.infer<typeof updateIncomeSchema>;
