"use server";

import { db } from "@/db";
import { income } from "@/db/schema/export";
import { auth } from "@/lib/auth";
import { and, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function getIncomeAction() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, message: "User not authenticated" };

    const records = await db
      .select()
      .from(income)
      .where(eq(income.userId, session.user.id))
      .orderBy(desc(income.date), desc(income.createdAt));

    return { success: true, data: records };
  } catch (error) {
    console.error("getIncomeAction error", error);
    return { success: false, message: "Failed to fetch income records" };
  }
}

export async function createIncomeAction(input: {
  date: Date;
  type: "Income" | "Transfer" | "Reimbursement";
  source:
    | "Salary"
    | "Freelance/Business"
    | "Friend Repayment"
    | "Interest/Dividends"
    | "Refund"
    | "ATM Withdrawal"
    | "Other";
  description?: string | null;
  amount: string;
  depositedTo: "Cash" | "Bank" | "UPI" | "Credit Card" | "Other";
  notes?: string | null;
}) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, message: "User not authenticated" };

    if (!input.amount || isNaN(Number(input.amount))) {
      return { success: false, message: "Valid amount is required" };
    }

    const [created] = await db
      .insert(income)
      .values({
        date: input.date,
        type: input.type,
        source: input.source,
        description: input.description?.trim() || null,
        amount: input.amount,
        depositedTo: input.depositedTo,
        notes: input.notes?.trim() || null,
        userId: session.user.id,
      })
      .returning();

    return { success: true, data: created };
  } catch (error) {
    console.error("createIncomeAction error", error);
    return { success: false, message: "Failed to create income record" };
  }
}

export async function updateIncomeAction(
  id: string,
  input: {
    date?: Date;
    type?: "Income" | "Transfer" | "Reimbursement";
    source?:
      | "Salary"
      | "Freelance/Business"
      | "Friend Repayment"
      | "Interest/Dividends"
      | "Refund"
      | "ATM Withdrawal"
      | "Other";
    description?: string | null;
    amount?: string;
    depositedTo?: "Cash" | "Bank" | "UPI" | "Credit Card" | "Other";
    notes?: string | null;
  }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, message: "User not authenticated" };

    const [updated] = await db
      .update(income)
      .set({
        ...(input.date !== undefined && { date: input.date }),
        ...(input.type !== undefined && { type: input.type }),
        ...(input.source !== undefined && { source: input.source }),
        ...(input.description !== undefined && {
          description: input.description?.trim() || null,
        }),
        ...(input.amount !== undefined && { amount: input.amount }),
        ...(input.depositedTo !== undefined && { depositedTo: input.depositedTo }),
        ...(input.notes !== undefined && { notes: input.notes?.trim() || null }),
      })
      .where(and(eq(income.id, id), eq(income.userId, session.user.id)))
      .returning();

    if (!updated) {
      return { success: false, message: "Income record not found or permission denied" };
    }

    return { success: true, data: updated };
  } catch (error) {
    console.error("updateIncomeAction error", error);
    return { success: false, message: "Failed to update income record" };
  }
}

export async function deleteIncomeAction(id: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, message: "User not authenticated" };

    const [deleted] = await db
      .delete(income)
      .where(and(eq(income.id, id), eq(income.userId, session.user.id)))
      .returning();

    if (!deleted) {
      return { success: false, message: "Income record not found or permission denied" };
    }

    return { success: true, data: deleted };
  } catch (error) {
    console.error("deleteIncomeAction error", error);
    return { success: false, message: "Failed to delete income record" };
  }
}
