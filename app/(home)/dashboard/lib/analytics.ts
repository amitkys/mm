import type { expansesLog, income } from "@/db/schema/export";

type IncomeRecord = Pick<
  typeof income.$inferSelect,
  "id" | "date" | "createdAt" | "type" | "source" | "amount"
>;

type TaggedIncomeRecord = Pick<
  typeof income.$inferSelect,
  "id" | "name" | "date" | "type" | "source" | "amount"
>;

type ExpenseRecord = Pick<
  typeof expansesLog.$inferSelect,
  "id" | "date" | "createdAt" | "type" | "category" | "subCategory" | "amount"
>;

type SpendingType = ExpenseRecord["type"];

const SPENDING_TYPES: SpendingType[] = ["NEED", "WANT", "INVESTMENT"];

function monthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function cents(amount: string) {
  return Math.round(Number(amount) * 100);
}

function currency(amountInCents: number) {
  return amountInCents / 100;
}

function percentageChange(current: number, previous: number) {
  return previous === 0 ? null : ((current - previous) / previous) * 100;
}

/** Summarizes one income tag across every linked expense date, matching its remaining balance on the Income page. */
export function buildTagAnalytics(
  tag: TaggedIncomeRecord,
  expenseRecords: ExpenseRecord[],
  selectedMonth: string
) {
  const receivedCents = cents(tag.amount);
  let spendingCents = 0;
  let investmentCents = 0;
  let selectedMonthOutflowCents = 0;
  const categoryTotals = new Map<string, number>();
  const typeTotals: Record<SpendingType, number> = {
    NEED: 0,
    WANT: 0,
    INVESTMENT: 0,
  };

  for (const record of expenseRecords) {
    const amount = cents(record.amount);
    typeTotals[record.type] += amount;
    if (record.type === "INVESTMENT") investmentCents += amount;
    else spendingCents += amount;
    if (monthKey(record.date) === selectedMonth) selectedMonthOutflowCents += amount;
    categoryTotals.set(record.category, (categoryTotals.get(record.category) ?? 0) + amount);
  }

  const outflowCents = spendingCents + investmentCents;

  return {
    tag: {
      id: tag.id,
      name: tag.name,
      date: tag.date.toISOString(),
      type: tag.type,
      source: tag.source,
    },
    summary: {
      received: currency(receivedCents),
      spending: currency(spendingCents),
      investment: currency(investmentCents),
      outflow: currency(outflowCents),
      remaining: currency(receivedCents - outflowCents),
      selectedMonthOutflow: currency(selectedMonthOutflowCents),
      expenseCount: expenseRecords.length,
    },
    categories: [...categoryTotals.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([category, amount]) => ({
        category,
        amount: currency(amount),
        percentage: outflowCents ? (amount / outflowCents) * 100 : 0,
      })),
    spendingTypes: SPENDING_TYPES.map((type) => ({
      type,
      amount: currency(typeTotals[type]),
      percentage: outflowCents ? (typeTotals[type] / outflowCents) * 100 : 0,
    })),
    recentExpenses: [...expenseRecords]
      .sort((a, b) => b.date.getTime() - a.date.getTime() || b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 6)
      .map((record) => ({
        id: record.id,
        date: record.date.toISOString(),
        category: record.category,
        detail: record.subCategory ?? record.type,
        amount: currency(cents(record.amount)),
      })),
  };
}

/** Aggregates only records already restricted to the signed-in user and six-month window. */
export function buildDashboardAnalytics(
  selectedMonth: string,
  incomeRecords: IncomeRecord[],
  expenseRecords: ExpenseRecord[]
) {
  const [year, month] = selectedMonth.split("-").map(Number);
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(Date.UTC(year, month - 6 + index, 1));
    return {
      month: monthKey(date),
      label: date.toLocaleDateString("en-IN", {
        month: "short",
        year: "2-digit",
        timeZone: "UTC",
      }),
      incomeCents: 0,
      outflowCents: 0,
    };
  });
  const monthlyTotals = new Map(months.map((item) => [item.month, item]));
  const previousMonth = months[4].month;

  let incomeCents = 0;
  let reimbursementCents = 0;
  let transferCents = 0;
  let spendingCents = 0;
  let investmentCents = 0;
  let previousIncomeCents = 0;
  let previousSpendingCents = 0;
  let selectedRecordCount = 0;

  const categoryTotals = new Map<string, number>();
  const typeTotals: Record<SpendingType, number> = {
    NEED: 0,
    WANT: 0,
    INVESTMENT: 0,
  };
  const activity: Array<{
    id: string;
    kind: "income" | "expense";
    date: string;
    createdAt: number;
    title: string;
    detail: string;
    amount: number;
  }> = [];

  for (const record of incomeRecords) {
    const recordMonth = monthKey(record.date);
    const amount = cents(record.amount);
    const trendMonth = monthlyTotals.get(recordMonth);

    if (record.type === "Income" && trendMonth) {
      trendMonth.incomeCents += amount;
    }

    if (recordMonth === previousMonth && record.type === "Income") {
      previousIncomeCents += amount;
    }

    if (recordMonth !== selectedMonth) continue;

    selectedRecordCount++;
    if (record.type === "Income") incomeCents += amount;
    if (record.type === "Reimbursement") reimbursementCents += amount;
    if (record.type === "Transfer") transferCents += amount;

    activity.push({
      id: record.id,
      kind: "income",
      date: record.date.toISOString(),
      createdAt: record.createdAt.getTime(),
      title: record.source,
      detail: record.type,
      amount: currency(amount),
    });
  }

  for (const record of expenseRecords) {
    const recordMonth = monthKey(record.date);
    const amount = cents(record.amount);
    const trendMonth = monthlyTotals.get(recordMonth);

    if (trendMonth) trendMonth.outflowCents += amount;
    if (recordMonth === previousMonth && record.type !== "INVESTMENT") {
      previousSpendingCents += amount;
    }

    if (recordMonth !== selectedMonth) continue;

    selectedRecordCount++;
    typeTotals[record.type] += amount;
    if (record.type === "INVESTMENT") {
      investmentCents += amount;
    } else {
      spendingCents += amount;
      categoryTotals.set(
        record.category,
        (categoryTotals.get(record.category) ?? 0) + amount
      );
    }

    activity.push({
      id: record.id,
      kind: "expense",
      date: record.date.toISOString(),
      createdAt: record.createdAt.getTime(),
      title: record.category,
      detail: record.subCategory ?? record.type,
      amount: currency(amount),
    });
  }

  const outflowCents = spendingCents + investmentCents;
  const categories = [...categoryTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => ({
      category,
      amount: currency(amount),
      percentage: spendingCents ? (amount / spendingCents) * 100 : 0,
    }));

  return {
    selectedMonth,
    summary: {
      income: currency(incomeCents),
      spending: currency(spendingCents),
      investment: currency(investmentCents),
      outflow: currency(outflowCents),
      reimbursement: currency(reimbursementCents),
      transfer: currency(transferCents),
      netFlow: currency(incomeCents + reimbursementCents - outflowCents),
      incomeChangePercent: percentageChange(incomeCents, previousIncomeCents),
      spendingChangePercent: percentageChange(spendingCents, previousSpendingCents),
      previousIncome: currency(previousIncomeCents),
      previousSpending: currency(previousSpendingCents),
      recordCount: selectedRecordCount,
    },
    trend: months.map(({ month: key, label, incomeCents: earned, outflowCents: spent }) => ({
      month: key,
      label,
      income: currency(earned),
      outflow: currency(spent),
    })),
    categories,
    spendingTypes: SPENDING_TYPES.map((type) => ({
      type,
      amount: currency(typeTotals[type]),
      percentage: outflowCents ? (typeTotals[type] / outflowCents) * 100 : 0,
    })),
    recentActivity: activity
      .sort((a, b) =>
        Date.parse(b.date) - Date.parse(a.date) || b.createdAt - a.createdAt
      )
      .slice(0, 6)
      .map((record) => ({
        id: record.id,
        kind: record.kind,
        date: record.date,
        title: record.title,
        detail: record.detail,
        amount: record.amount,
      })),
  };
}
