"use client"

import { createColumnHelper } from "@tanstack/react-table"
import { type DataTableFeatures } from "./data-table-feature"
import { type Income } from "./query/get"
import { IncomeRowActions } from "./_components/income-row-actions"

const columnHelper = createColumnHelper<DataTableFeatures, Income>()

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
        header: "Amount",
        cell: (info) => {
            const num = Number(info.getValue());
            return isNaN(num) ? info.getValue() : `$${num.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
        },
    }),
    columnHelper.accessor("depositedTo", {
        header: "Deposited To",
    }),
    columnHelper.accessor("name", {
        header: "Tag",
        cell: (info) => <span className="font-mono text-xs text-muted-foreground">{info.getValue()}</span>,
    }),
    columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: (info) => <IncomeRowActions incomeItem={info.row.original} />,
    }),
])
