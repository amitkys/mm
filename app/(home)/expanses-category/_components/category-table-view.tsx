"use client";

import { columns } from "../column";
import { DataTable } from "../data-table";
import { useGetExpansesCategoryQuery } from "../query/get";
import { AddCategorySheet } from "./add-category-sheet";
import { Loader2 } from "lucide-react";

export function CategoryTableView() {
  const { data, isLoading, isError, error } = useGetExpansesCategoryQuery();

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-md border">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading expense categories...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-48 items-center justify-center rounded-md border border-destructive/20 bg-destructive/10 p-4 text-destructive">
        <p>Error: {error?.message || "Failed to load expense categories."}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Expense Categories List</h2>
          <p className="text-sm text-muted-foreground">
            Manage system default and custom expense categories.
          </p>
        </div>
        <AddCategorySheet categories={data ?? []} />
      </div>
      <DataTable columns={columns} data={data ?? []} />
    </div>
  );
}
