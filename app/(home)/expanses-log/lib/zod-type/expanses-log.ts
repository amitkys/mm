import { z } from "zod";
import {
  paymentMethodEnum,
  incomeSourceEnum,
  expansesTypeEnum,
} from "@/db/schema/export";

export const createExpansesLogSchema = z.object({
  date: z.date({ error: "Date is required" }),
  incomeId: z.string().nullable().optional(),
  name: z.string().trim().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  category: z.string().trim().min(1, { error: "Category is required" }),
  subCategory: z.string().trim().nullable().optional(),
  description: z.string().trim().nullable().optional(),
  amount: z
    .string()
    .min(1, { error: "Amount is required" })
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Amount must be a positive number",
    }),
  paymentMethod: z.enum(paymentMethodEnum.enumValues),
  source: z.enum(incomeSourceEnum.enumValues).nullable().optional(),
  type: z.enum(expansesTypeEnum.enumValues),
});

export type CreateExpansesLogSchema = z.infer<
  typeof createExpansesLogSchema
>;

export const updateExpansesLogSchema = createExpansesLogSchema.partial();

export type UpdateExpansesLogSchema = z.infer<
  typeof updateExpansesLogSchema
>;
