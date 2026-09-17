"use server";

import { db } from "@/db";
import { expansesLog } from "@/db/schema/export";
import { auth } from "@/lib/auth";
import { and, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import {
  createExpansesLogSchema,
  type CreateExpansesLogSchema,
  updateExpansesLogSchema,
  type UpdateExpansesLogSchema,
} from "./zod-type/expanses-log";

export async function getExpansesLogAction() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, message: "User not authenticated" };

    const logs = await db
      .select()
      .from(expansesLog)
      .where(eq(expansesLog.userId, session.user.id))
      .orderBy(desc(expansesLog.date), desc(expansesLog.createdAt));

    return { success: true, data: logs };
  } catch (error) {
    console.error("getExpansesLogAction error", error);
    return { success: false, message: "Failed to fetch expense logs" };
  }
}

export async function createExpansesLogAction(input: CreateExpansesLogSchema) {
  try {
    const parsed = createExpansesLogSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message || "Invalid input data",
      };
    }

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, message: "User not authenticated" };

    const [created] = await db
      .insert(expansesLog)
      .values({
        date: parsed.data.date,
        incomeId: parsed.data.incomeId || null,
        name: parsed.data.name?.trim() || null,
        categoryId: parsed.data.categoryId || null,
        category: parsed.data.category.trim(),
        subCategory: parsed.data.subCategory?.trim() || null,
        description: parsed.data.description?.trim() || null,
        amount: parsed.data.amount,
        paymentMethod: parsed.data.paymentMethod,
        source: parsed.data.source || null,
        type: parsed.data.type,
        userId: session.user.id,
      })
      .returning();

    return { success: true, data: created };
  } catch (error) {
    console.error("createExpansesLogAction error", error);
    return { success: false, message: "Failed to create expense log" };
  }
}

export async function updateExpansesLogAction(
  id: string,
  input: UpdateExpansesLogSchema
) {
  try {
    const parsed = updateExpansesLogSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message || "Invalid input data",
      };
    }

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, message: "User not authenticated" };

    const [updated] = await db
      .update(expansesLog)
      .set({
        ...(parsed.data.date !== undefined && { date: parsed.data.date }),
        ...(parsed.data.incomeId !== undefined && { incomeId: parsed.data.incomeId }),
        ...(parsed.data.name !== undefined && { name: parsed.data.name?.trim() || null }),
        ...(parsed.data.categoryId !== undefined && { categoryId: parsed.data.categoryId }),
        ...(parsed.data.category !== undefined && { category: parsed.data.category.trim() }),
        ...(parsed.data.subCategory !== undefined && {
          subCategory: parsed.data.subCategory?.trim() || null,
        }),
        ...(parsed.data.description !== undefined && {
          description: parsed.data.description?.trim() || null,
        }),
        ...(parsed.data.amount !== undefined && { amount: parsed.data.amount }),
        ...(parsed.data.paymentMethod !== undefined && {
          paymentMethod: parsed.data.paymentMethod,
        }),
        ...(parsed.data.source !== undefined && { source: parsed.data.source || null }),
        ...(parsed.data.type !== undefined && { type: parsed.data.type }),
      })
      .where(and(eq(expansesLog.id, id), eq(expansesLog.userId, session.user.id)))
      .returning();

    if (!updated) {
      return { success: false, message: "Expense log not found or permission denied" };
    }

    return { success: true, data: updated };
  } catch (error) {
    console.error("updateExpansesLogAction error", error);
    return { success: false, message: "Failed to update expense log" };
  }
}

export async function deleteExpansesLogAction(id: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, message: "User not authenticated" };

    const [deleted] = await db
      .delete(expansesLog)
      .where(and(eq(expansesLog.id, id), eq(expansesLog.userId, session.user.id)))
      .returning();

    if (!deleted) {
      return { success: false, message: "Expense log not found or permission denied" };
    }

    return { success: true, data: deleted };
  } catch (error) {
    console.error("deleteExpansesLogAction error", error);
    return { success: false, message: "Failed to delete expense log" };
  }
}
