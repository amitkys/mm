"use client";

import { columns } from "../column";
import { DataTable } from "../data-table";
import { useGetExpansesLogQuery } from "../query/get";
import { AddExpansesLogSheet } from "./add-expanses-log-sheet";
import { PrintExpansesLogReportSheet } from "./print-expanses-log-report-sheet";
import { Spinner } from "@/components/ui/spinner";

export function ExpansesLogTableView() {
  const { data, isLoading, isError, error } = useGetExpansesLogQuery();

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-md border">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Spinner size="md" />
          <span>Loading expense logs...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-48 items-center justify-center rounded-md border border-destructive/20 bg-destructive/10 p-4 text-destructive">
        <p>Error: {error?.message || "Failed to load expense logs."}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          <PrintExpansesLogReportSheet logs={data ?? []} />
          <AddExpansesLogSheet />
        </div>
      </div>
      <DataTable columns={columns} data={data ?? []} />
    </div>
  );
}
