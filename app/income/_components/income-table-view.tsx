"use client";

import { columns } from "../column";
import { DataTable } from "../data-table";
import { useGetIncomeQuery } from "../query/get";
import { AddIncomeSheet } from "./add-income-sheet";
import { Loader2 } from "lucide-react";

export function IncomeTableView() {
  const { data, isLoading, isError, error } = useGetIncomeQuery();

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-md border">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading income records...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-48 items-center justify-center rounded-md border border-destructive/20 bg-destructive/10 p-4 text-destructive">
        <p>Error: {error?.message || "Failed to load income records."}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Income Records</h2>
          <p className="text-sm text-muted-foreground">
            Track and manage your income, transfers, and reimbursements.
          </p>
        </div>
        <AddIncomeSheet />
      </div>
      <DataTable columns={columns} data={data ?? []} />
    </div>
  );
}
