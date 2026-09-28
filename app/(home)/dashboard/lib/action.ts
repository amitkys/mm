"use server";

import { db } from "@/db";
import { expansesLog, income } from "@/db/schema/export";
import { requireUnlockedSession } from "@/lib/pin-access";
import { and, desc, gte, lt, eq } from "drizzle-orm";
import { z } from "zod";
import { buildDashboardAnalytics, buildTagAnalytics } from "./analytics";

const dashboardMonthSchema = z
  .string()
  .regex(/^[1-9]\d{3}-(0[1-9]|1[0-2])$/, { error: "Invalid month" });
const dashboardTagSchema = z.union([z.literal("all"), z.string().min(1).max(128)]);
const dashboardFilterSchema = z.object({ month: dashboardMonthSchema, tagId: dashboardTagSchema });
const expenseFields = {
  id: expansesLog.id,
  date: expansesLog.date,
  createdAt: expansesLog.createdAt,
  type: expansesLog.type,
  category: expansesLog.category,
  subCategory: expansesLog.subCategory,
  amount: expansesLog.amount,
};

function monthBounds(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  return {
    selectedStart: new Date(Date.UTC(year, monthNumber - 1, 1)),
    trendStart: new Date(Date.UTC(year, monthNumber - 6, 1)),
    end: new Date(Date.UTC(year, monthNumber, 1)),
  };
}

export async function getDashboardTagsAction(month: string) {
  try {
    const parsed = dashboardMonthSchema.safeParse(month);
    if (!parsed.success) return { success: false, message: "Invalid month" };

    const access = await requireUnlockedSession();
    if (!access.success) return access;

    const { selectedStart, end } = monthBounds(parsed.data);
    const tags = await db
      .select({
        id: income.id,
        name: income.name,
        type: income.type,
        source: income.source,
      })
      .from(income)
      .where(and(
        eq(income.userId, access.session.user.id),
        gte(income.date, selectedStart),
        lt(income.date, end)
      ))
      .orderBy(desc(income.date), desc(income.createdAt));

    return { success: true, data: tags };
  } catch (error) {
    console.error("getDashboardTagsAction error", error);
    return { success: false, message: "Failed to load dashboard tags" };
  }
}

export async function getDashboardAction(month: string, tagId: string = "all") {
  try {
    const parsed = dashboardFilterSchema.safeParse({ month, tagId });
    if (!parsed.success) {
      return { success: false, message: "Invalid dashboard filter" };
    }

    const access = await requireUnlockedSession();
    if (!access.success) return access;

    const { selectedStart, trendStart, end } = monthBounds(parsed.data.month);
    const userId = access.session.user.id;

    if (parsed.data.tagId !== "all") {
      const [tag] = await db
        .select({
          id: income.id,
          name: income.name,
          date: income.date,
          createdAt: income.createdAt,
          type: income.type,
          source: income.source,
          amount: income.amount,
        })
        .from(income)
        .where(and(
          eq(income.id, parsed.data.tagId),
          eq(income.userId, userId),
          gte(income.date, selectedStart),
          lt(income.date, end)
        ))
        .limit(1);

      if (!tag) return { success: false, message: "Tag not found in selected month" };

      const linkedExpenses = await db
        .select(expenseFields)
        .from(expansesLog)
        .where(and(
          eq(expansesLog.userId, userId),
          eq(expansesLog.incomeId, tag.id)
        ));

      return {
        success: true,
        data: {
          ...buildDashboardAnalytics(parsed.data.month, [tag], linkedExpenses),
          tagInsight: buildTagAnalytics(tag, linkedExpenses, parsed.data.month),
        },
      };
    }

    const [incomeRecords, expenseRecords] = await Promise.all([
      db
        .select({
          id: income.id,
          date: income.date,
          createdAt: income.createdAt,
          type: income.type,
          source: income.source,
          amount: income.amount,
        })
        .from(income)
        .where(and(
          eq(income.userId, userId),
          gte(income.date, trendStart),
          lt(income.date, end)
        )),
      db
        .select(expenseFields)
        .from(expansesLog)
        .where(and(
          eq(expansesLog.userId, userId),
          gte(expansesLog.date, trendStart),
          lt(expansesLog.date, end)
        )),
    ]);

    return {
      success: true,
      data: {
        ...buildDashboardAnalytics(parsed.data.month, incomeRecords, expenseRecords),
        tagInsight: null,
      },
    };
  } catch (error) {
    console.error("getDashboardAction error", error);
    return { success: false, message: "Failed to load dashboard" };
  }
}
