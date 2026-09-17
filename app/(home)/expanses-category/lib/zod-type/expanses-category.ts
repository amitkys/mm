import { z } from "zod";

export const createExpansesCategorySchema = z.object({
  category: z.string().trim().min(1, { error: "Category name is required" }),
  subCategory: z.string().trim().nullable().optional(),
});

export type CreateExpansesCategorySchema = z.infer<
  typeof createExpansesCategorySchema
>;

export const updateExpansesCategorySchema = z.object({
  category: z.string().trim().min(1, { error: "Category name is required" }),
  subCategory: z.string().trim().nullable().optional(),
});

export type UpdateExpansesCategorySchema = z.infer<
  typeof updateExpansesCategorySchema
>;
