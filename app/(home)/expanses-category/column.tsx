"use client"

import { createColumnHelper } from "@tanstack/react-table"

import { type DataTableFeatures } from "./data-table-feature"
import { type ExpansesCategory } from "./query/get"
import { CategoryRowActions } from "./_components/category-row-actions"

const columnHelper = createColumnHelper<DataTableFeatures, ExpansesCategory>()

export const columns = columnHelper.columns([
    columnHelper.accessor("category", {
        header: "Category",
    }),
    columnHelper.accessor("subCategory", {
        header: "Sub Category",
        cell: (info) => info.getValue() || "-",
    }),
    columnHelper.accessor("isDefault", {
        header: "Type",
        cell: (info) => (info.getValue() ? "System Default" : "Custom"),
    }),
    columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: (info) => <CategoryRowActions categoryItem={info.row.original} />,
    }),
])