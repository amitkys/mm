"use client"

import { createColumnHelper } from "@tanstack/react-table"
import { type DataTableFeatures } from "./data-table-feature"
import { type ExpansesLog } from "./query/get"
import { ExpansesLogRowActions } from "./_components/expanses-log-row-actions"

const columnHelper = createColumnHelper<DataTableFeatures, ExpansesLog>()

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
    columnHelper.accessor("category", {
        header: "Category",
        cell: (info) => {
            const row = info.row.original;
            return (
                <div className="flex flex-col">
                    <span className="font-medium text-foreground">{row.category}</span>
                    {row.subCategory && (
                        <span className="text-xs text-muted-foreground">{row.subCategory}</span>
                    )}
                </div>
            );
        },
    }),
    columnHelper.accessor("description", {
        header: "Description",
        cell: (info) => info.getValue() || "-",
    }),
    columnHelper.accessor("amount", {
        header: "Amount",
        cell: (info) => {
            const num = Number(info.getValue());
            return isNaN(num)
                ? info.getValue()
                : `$${num.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
        },
    }),
    columnHelper.accessor("paymentMethod", {
        header: "Payment Method",
        cell: (info) => (
            <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                {info.getValue()}
            </span>
        ),
    }),
    columnHelper.accessor("source", {
        header: "Source",
        cell: (info) => info.getValue() || "-",
    }),
    columnHelper.accessor("type", {
        header: "Type",
        cell: (info) => {
            const type = info.getValue();
            let colorClass = "bg-primary/10 text-primary";
            if (type === "NEED") colorClass = "bg-blue-500/10 text-blue-600 dark:text-blue-400";
            if (type === "WANT") colorClass = "bg-amber-500/10 text-amber-600 dark:text-amber-400";
            if (type === "INVESTMENT") colorClass = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";

            return (
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colorClass}`}>
                    {type}
                </span>
            );
        },
    }),
    columnHelper.accessor("name", {
        header: "Tag",
        cell: (info) => (
            <span className="font-mono text-xs text-muted-foreground">
                {info.getValue()}
            </span>
        ),
    }),
    columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: (info) => <ExpansesLogRowActions logItem={info.row.original} />,
    }),
])
