"use client";

import { useState, useMemo } from "react";
import { columns } from "../column";
import { DataTable } from "../data-table";
import { useGetIncomeQuery, type EnrichedIncome } from "../query/get";
import { useGetExpansesLogQuery, type ExpansesLog } from "@/app/(home)/expanses-log/query/get";
import { AddIncomeSheet } from "./add-income-sheet";
import { IncomeExpansesLogSheet } from "./income-expanses-log-sheet";
import { Spinner } from "@/components/ui/spinner";

export function IncomeTableView() {
  const { data: incomeData, isLoading: isIncomeLoading, isError: isIncomeError, error: incomeError } = useGetIncomeQuery();
  const { data: expenseData, isLoading: isExpenseLoading } = useGetExpansesLogQuery();

  const [selectedIncome, setSelectedIncome] = useState<EnrichedIncome | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleOpenSheet = (income: EnrichedIncome) => {
    setSelectedIncome(income);
    setIsSheetOpen(true);
  };

  const selectedTaggedLogs = useMemo(() => {
    if (!selectedIncome || !expenseData) return [];
    return expenseData.filter((log) => log.incomeId === selectedIncome.id);
  }, [selectedIncome, expenseData]);

  const enrichedIncomeData = useMemo(() => {
    if (!incomeData) return [];
    const expensesByIncomeId: Record<string, ExpansesLog[]> = {};
    const expenseSums: Record<string, number> = {};

    (expenseData ?? []).forEach((exp) => {
      if (exp.incomeId) {
        if (!expensesByIncomeId[exp.incomeId]) {
          expensesByIncomeId[exp.incomeId] = [];
        }
        expensesByIncomeId[exp.incomeId].push(exp);
        expenseSums[exp.incomeId] =
          (expenseSums[exp.incomeId] || 0) + (Number(exp.amount) || 0);
      }
    });

    return incomeData.map((inc) => {
      const totalSpent = expenseSums[inc.id] || 0;
      const amountNum = Number(inc.amount) || 0;
      const remaining = amountNum - totalSpent;
      const spentPercent =
        amountNum > 0 ? Math.min(100, Math.round((totalSpent / amountNum) * 100)) : 0;
      return {
        ...inc,
        totalSpent,
        remaining,
        spentPercent,
        taggedLogs: expensesByIncomeId[inc.id] || [],
        onOpenSheet: handleOpenSheet,
      };
    });
  }, [incomeData, expenseData]);

  const isLoading = isIncomeLoading || isExpenseLoading;

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-md border">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Spinner size="md" />
          <span>Loading income records & analytics...</span>
        </div>
      </div>
    );
  }

  if (isIncomeError) {
    return (
      <div className="flex h-48 items-center justify-center rounded-md border border-destructive/20 bg-destructive/10 p-4 text-destructive">
        <p>Error: {incomeError?.message || "Failed to load income records."}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <AddIncomeSheet />
      </div>

      <DataTable columns={columns} data={enrichedIncomeData} />

      <IncomeExpansesLogSheet
        incomeItem={selectedIncome}
        taggedLogs={selectedTaggedLogs}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      />
    </div>
  );
}

