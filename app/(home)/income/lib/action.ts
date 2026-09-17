"use server";

import { db } from "@/db";
import { income } from "@/db/schema/export";
import { auth } from "@/lib/auth";
import { and, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import {
  createIncomeSchema,
  type CreateIncomeSchema,
  updateIncomeSchema,
  type UpdateIncomeSchema,
} from "./zod-type/income";

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

export async function createIncomeAction(input: CreateIncomeSchema) {
  try {
    const parsed = createIncomeSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message || "Invalid input data",
      };
    }

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, message: "User not authenticated" };

    const [created] = await db
      .insert(income)
      .values({
        date: parsed.data.date,
        type: parsed.data.type,
        source: parsed.data.source,
        description: parsed.data.description?.trim() || null,
        amount: parsed.data.amount,
        depositedTo: parsed.data.depositedTo,
        notes: parsed.data.notes?.trim() || null,
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
  input: UpdateIncomeSchema
) {
  try {
    const parsed = updateIncomeSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message || "Invalid input data",
      };
    }

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, message: "User not authenticated" };

    const [updated] = await db
      .update(income)
      .set({
        ...(parsed.data.date !== undefined && { date: parsed.data.date }),
        ...(parsed.data.type !== undefined && { type: parsed.data.type }),
        ...(parsed.data.source !== undefined && { source: parsed.data.source }),
        ...(parsed.data.description !== undefined && {
          description: parsed.data.description?.trim() || null,
        }),
        ...(parsed.data.amount !== undefined && { amount: parsed.data.amount }),
        ...(parsed.data.depositedTo !== undefined && { depositedTo: parsed.data.depositedTo }),
        ...(parsed.data.notes !== undefined && { notes: parsed.data.notes?.trim() || null }),
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
