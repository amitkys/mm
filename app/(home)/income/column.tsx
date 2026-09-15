"use client"

import { createColumnHelper } from "@tanstack/react-table"
import { type DataTableFeatures } from "./data-table-feature"
import { type EnrichedIncome } from "./query/get"
import { IncomeRowActions } from "./_components/income-row-actions"
import { IncomeCategoryBreakdownPopover } from "./_components/income-category-breakdown-popover"

const columnHelper = createColumnHelper<DataTableFeatures, EnrichedIncome>()

export const columns = columnHelper.columns([
    columnHelper.accessor("date", {
        header: "Date",
        cell: (info) => {
            const val = info.getValue();
            if (!val) return "-";
            const dateObj = new Date(val);
            return dateObj.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        },
    }),
    columnHelper.accessor("name", {
        header: "Tag",
        cell: (info) => {
            const row = info.row.original;
            return (
                <IncomeCategoryBreakdownPopover
                    incomeItem={row}
                    taggedLogs={row.taggedLogs ?? []}
                    onViewLogsClick={() => row.onOpenSheet?.(row)}
                >
                    <span className="font-mono text-xs font-semibold text-primary hover:underline hover:text-primary/80 transition-colors">
                        {info.getValue()}
                    </span>
                </IncomeCategoryBreakdownPopover>
            );
        },
    }),
    columnHelper.accessor("type", {
        header: "Type",
        cell: (info) => (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {info.getValue()}
            </span>
        ),
    }),
    columnHelper.accessor("source", {
        header: "Source",
    }),
    columnHelper.accessor("amount", {
        header: "Received Amount",
        cell: (info) => {
            const num = Number(info.getValue());
            return isNaN(num) ? info.getValue() : `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
        },
    }),
    columnHelper.accessor("remaining", {
        header: "Remaining / Spent",
        cell: (info) => {
            const row = info.row.original;
            const remaining = row.remaining ?? Number(row.amount) ?? 0;
            const spent = row.totalSpent ?? 0;
            const percent = row.spentPercent ?? 0;
            const isOverspent = remaining < 0;

            return (
                <IncomeCategoryBreakdownPopover
                    incomeItem={row}
                    taggedLogs={row.taggedLogs ?? []}
                    onViewLogsClick={() => row.onOpenSheet?.(row)}
                >
                    <div className="flex flex-col gap-1 min-w-[130px] p-1 rounded-md hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between text-xs">
                            <span className={isOverspent ? "text-rose-500 font-bold" : "font-semibold text-emerald-600 dark:text-emerald-400"}>
                                ₹{remaining.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                                {percent}% spent
                            </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                            <div
                                className={`h-full transition-all ${
                                    isOverspent
                                        ? "bg-rose-500"
                                        : percent > 85
                                        ? "bg-amber-500"
                                        : "bg-emerald-500"
                                }`}
                                style={{ width: `${Math.min(100, percent)}%` }}
                            />
                        </div>
                    </div>
                </IncomeCategoryBreakdownPopover>
            );
        },
    }),
    columnHelper.accessor("depositedTo", {
        header: "Deposited To",
    }),
    columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: (info) => <IncomeRowActions incomeItem={info.row.original} />,
    }),
])
