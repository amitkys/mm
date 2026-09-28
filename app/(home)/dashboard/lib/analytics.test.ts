// @ts-expect-error Bun test types are not part of the Next.js tsconfig.
import { describe, test as it } from "bun:test";
import assert from "node:assert/strict";
import { buildDashboardAnalytics, buildTagAnalytics } from "./analytics";

const createdAt = new Date("2026-08-01T00:00:00.000Z");
const incomeRecord = (id: string, date: string, type: "Income" | "Transfer" | "Reimbursement", amount: string) => ({
  id,
  date: new Date(date),
  createdAt,
  type,
  source: "Salary" as const,
  amount,
});
const expenseRecord = (id: string, date: string, type: "NEED" | "WANT" | "INVESTMENT", category: string, amount: string) => ({
  id,
  date: new Date(date),
  createdAt,
  type,
  category,
  subCategory: null,
  amount,
});

describe("dashboard analytics", () => {
  it("keeps transfers and reimbursements distinct from earned income", () => {
    const result = buildDashboardAnalytics("2026-09", [
      incomeRecord("a", "2026-09-02", "Income", "1000.10"),
      incomeRecord("b", "2026-09-03", "Reimbursement", "50.20"),
      incomeRecord("c", "2026-09-04", "Transfer", "200.00"),
    ], [
      expenseRecord("d", "2026-09-05", "NEED", "Food", "100.05"),
      expenseRecord("e", "2026-09-06", "WANT", "Food", "25.10"),
      expenseRecord("f", "2026-09-07", "INVESTMENT", "Stocks", "300.00"),
    ]);

    assert.deepEqual({
      income: result.summary.income,
      reimbursement: result.summary.reimbursement,
      transfer: result.summary.transfer,
      spending: result.summary.spending,
      investment: result.summary.investment,
      outflow: result.summary.outflow,
      netFlow: result.summary.netFlow,
      recordCount: result.summary.recordCount,
    }, {
      income: 1000.1,
      reimbursement: 50.2,
      transfer: 200,
      spending: 125.15,
      investment: 300,
      outflow: 425.15,
      netFlow: 625.15,
      recordCount: 6,
    });
    assert.deepEqual(result.categories, [{ category: "Food", amount: 125.15, percentage: 100 }]);
    assert.equal(result.trend.at(-1)?.income, 1000.1);
    assert.equal(result.trend.at(-1)?.outflow, 425.15);
  });

  it("uses the previous month for comparisons and preserves empty months", () => {
    const result = buildDashboardAnalytics("2026-09", [
      incomeRecord("a", "2026-08-15", "Income", "100"),
      incomeRecord("b", "2026-09-15", "Income", "125"),
    ], [
      expenseRecord("c", "2026-08-15", "NEED", "Food", "40"),
      expenseRecord("d", "2026-08-15", "INVESTMENT", "Stocks", "100"),
      expenseRecord("e", "2026-09-15", "WANT", "Travel", "50"),
    ]);

    assert.equal(result.summary.incomeChangePercent, 25);
    assert.equal(result.summary.spendingChangePercent, 25);
    assert.equal(result.trend.length, 6);
    assert.deepEqual({ month: result.trend[0].month, income: result.trend[0].income, outflow: result.trend[0].outflow }, { month: "2026-04", income: 0, outflow: 0 });
    assert.equal(result.trend[4].income, 100);
    assert.equal(result.trend[4].outflow, 140);
  });

  it("empty activity does not invent a percentage change", () => {
    const result = buildDashboardAnalytics("2026-01", [], []);
    assert.equal(result.summary.incomeChangePercent, null);
    assert.equal(result.summary.spendingChangePercent, null);
    assert.deepEqual(result.recentActivity, []);
    assert.equal(result.trend[0].month, "2025-08");
  });

  it("a tag subtracts every linked expense while showing the selected month's outflow separately", () => {
    const tag = {
      id: "tag-a",
      name: "salary-september",
      date: new Date("2026-09-01"),
      type: "Income" as const,
      source: "Salary" as const,
      amount: "1000.00",
    };
    const result = buildTagAnalytics(tag, [
      expenseRecord("a", "2026-09-10", "NEED", "Food", "200.25"),
      expenseRecord("b", "2026-10-10", "WANT", "Travel", "300.00"),
      expenseRecord("c", "2026-11-10", "INVESTMENT", "Stocks", "600.00"),
    ], "2026-09");

    assert.deepEqual(result.summary, {
      received: 1000,
      spending: 500.25,
      investment: 600,
      outflow: 1100.25,
      remaining: -100.25,
      selectedMonthOutflow: 200.25,
      expenseCount: 3,
    });
    assert.equal(result.categories[0].category, "Stocks");
    assert.equal(result.recentExpenses[0].id, "c");
  });

  it("a tag with no linked expenses retains the full received amount", () => {
    const result = buildTagAnalytics({
      id: "tag-b",
      name: "transfer-september",
      date: new Date("2026-09-01"),
      type: "Transfer",
      source: "Salary",
      amount: "250.50",
    }, [], "2026-09");

    assert.equal(result.summary.remaining, 250.5);
    assert.equal(result.summary.outflow, 0);
    assert.deepEqual(result.categories, []);
    assert.deepEqual(result.recentExpenses, []);
  });
});
