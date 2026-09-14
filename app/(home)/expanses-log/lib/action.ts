"use server";

import { db } from "@/db";
import { expansesLog } from "@/db/schema/export";
import { auth } from "@/lib/auth";
import { and, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";

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

export async function createExpansesLogAction(input: {
  date: Date;
  incomeId?: string | null;
  name?: string | null;
  categoryId?: string | null;
  category: string;
  subCategory?: string | null;
  description?: string | null;
  amount: string;
  paymentMethod:
    | "CASH"
    | "DEBIT CARD"
    | "CREDIT CARD"
    | "UPI"
    | "NET BANKING"
    | "OTHER";
  source?:
    | "Salary"
    | "Freelance/Business"
    | "Friend Repayment"
    | "Interest/Dividends"
    | "Refund"
    | "ATM Withdrawal"
    | "Other"
    | null;
  type: "NEED" | "WANT" | "INVESTMENT";
}) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, message: "User not authenticated" };

    if (!input.amount || isNaN(Number(input.amount))) {
      return { success: false, message: "Valid amount is required" };
    }

    if (!input.category || !input.category.trim()) {
      return { success: false, message: "Category is required" };
    }

    const [created] = await db
      .insert(expansesLog)
      .values({
        date: input.date,
        incomeId: input.incomeId || null,
        name: input.name?.trim() || null,
        categoryId: input.categoryId || null,
        category: input.category.trim(),
        subCategory: input.subCategory?.trim() || null,
        description: input.description?.trim() || null,
        amount: input.amount,
        paymentMethod: input.paymentMethod,
        source: input.source || null,
        type: input.type,
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
  input: {
    date?: Date;
    incomeId?: string | null;
    name?: string | null;
    categoryId?: string | null;
    category?: string;
    subCategory?: string | null;
    description?: string | null;
    amount?: string;
    paymentMethod?:
      | "CASH"
      | "DEBIT CARD"
      | "CREDIT CARD"
      | "UPI"
      | "NET BANKING"
      | "OTHER";
    source?:
      | "Salary"
      | "Freelance/Business"
      | "Friend Repayment"
      | "Interest/Dividends"
      | "Refund"
      | "ATM Withdrawal"
      | "Other"
      | null;
    type?: "NEED" | "WANT" | "INVESTMENT";
  }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, message: "User not authenticated" };

    const [updated] = await db
      .update(expansesLog)
      .set({
        ...(input.date !== undefined && { date: input.date }),
        ...(input.incomeId !== undefined && { incomeId: input.incomeId }),
        ...(input.name !== undefined && { name: input.name?.trim() || null }),
        ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
        ...(input.category !== undefined && { category: input.category.trim() }),
        ...(input.subCategory !== undefined && {
          subCategory: input.subCategory?.trim() || null,
        }),
        ...(input.description !== undefined && {
          description: input.description?.trim() || null,
        }),
        ...(input.amount !== undefined && { amount: input.amount }),
        ...(input.paymentMethod !== undefined && {
          paymentMethod: input.paymentMethod,
        }),
        ...(input.source !== undefined && { source: input.source || null }),
        ...(input.type !== undefined && { type: input.type }),
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
