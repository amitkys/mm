"use server";

import { db } from "@/db";
import { expansesCategory } from "@/db/schema/export";
import { requireUnlockedSession } from "@/lib/pin-access";
import { and, eq, isNull, or } from "drizzle-orm";
import {
  createExpansesCategorySchema,
  type CreateExpansesCategorySchema,
  updateExpansesCategorySchema,
  type UpdateExpansesCategorySchema,
} from "./zod-type/expanses-category";

export async function getExpansesCategoryAction() {
  try {
    const access = await requireUnlockedSession();
    if (!access.success) return access;
    const { session } = access;

    const categories = await db
      .select()
      .from(expansesCategory)
      .where(
        or(
          eq(expansesCategory.userId, session.user.id),
          isNull(expansesCategory.userId)
        )
      )
      .orderBy(expansesCategory.category, expansesCategory.subCategory);

    return { success: true, data: categories };
  } catch (error) {
    console.error("getExpansesCategoryAction error", error);
    return { success: false, message: "Failed to fetch expense categories" };
  }
}

export async function createExpansesCategoryAction(input: CreateExpansesCategorySchema) {
  try {
    const parsed = createExpansesCategorySchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message || "Invalid input data",
      };
    }

    const access = await requireUnlockedSession();
    if (!access.success) return access;
    const { session } = access;

    const [created] = await db
      .insert(expansesCategory)
      .values({
        category: parsed.data.category,
        subCategory: parsed.data.subCategory || null,
        userId: session.user.id,
        isDefault: false,
      })
      .returning();

    return { success: true, data: created };
  } catch (error) {
    console.error("createExpansesCategoryAction error", error);
    return { success: false, message: "Failed to create category" };
  }
}

export async function updateExpansesCategoryAction(
  id: string,
  input: UpdateExpansesCategorySchema
) {
  try {
    const parsed = updateExpansesCategorySchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message || "Invalid input data",
      };
    }

    const access = await requireUnlockedSession();
    if (!access.success) return access;
    const { session } = access;

    const [existing] = await db
      .select()
      .from(expansesCategory)
      .where(eq(expansesCategory.id, id));

    if (!existing) {
      return { success: false, message: "Category not found" };
    }

    if (existing.userId === session.user.id) {
      const [updated] = await db
        .update(expansesCategory)
        .set({
          category: parsed.data.category,
          subCategory: parsed.data.subCategory || null,
        })
        .where(
          and(
            eq(expansesCategory.id, id),
            eq(expansesCategory.userId, session.user.id)
          )
        )
        .returning();

      return { success: true, data: updated };
    } else if (existing.userId === null && existing.isDefault) {
      const [created] = await db
        .insert(expansesCategory)
        .values({
          category: parsed.data.category,
          subCategory: parsed.data.subCategory || null,
          userId: session.user.id,
          isDefault: false,
        })
        .returning();

      return { success: true, data: created };
    }

    return { success: false, message: "Unauthorized to update this category" };
  } catch (error) {
    console.error("updateExpansesCategoryAction error", error);
    return { success: false, message: "Failed to update expense category" };
  }
}

export async function deleteExpansesCategoryAction(id: string) {
  try {
    const access = await requireUnlockedSession();
    if (!access.success) return access;
    const { session } = access;

    const [deleted] = await db
      .delete(expansesCategory)
      .where(
        and(
          eq(expansesCategory.id, id),
          eq(expansesCategory.userId, session.user.id)
        )
      )
      .returning();

    if (!deleted) {
      return {
        success: false,
        message: "System default categories cannot be deleted directly",
      };
    }

    return { success: true, data: deleted };
  } catch (error) {
    console.error("deleteExpansesCategoryAction error", error);
    return { success: false, message: "Failed to delete expense category" };
  }
}
