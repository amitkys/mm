"use client"

import { useState, useMemo } from "react"
import { useTable, type ColumnDef, type RowData, type ColumnFiltersState } from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { features, type DataTableFeatures } from "./data-table-feature"
import { Filter, RotateCcw } from "lucide-react"

interface DataTableProps<TData extends RowData> {
    columns: ColumnDef<DataTableFeatures, TData>[]
    data: TData[]
}

export function DataTable<TData extends RowData>({
    columns,
    data,
}: DataTableProps<TData>) {
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [categoryFilter, setCategoryFilter] = useState<string>("")

    const availableCategories = useMemo(() => {
        const cats = (data as any[])
            .map((item) => item.category)
            .filter((c): c is string => Boolean(c))
        return Array.from(new Set(cats)).sort()
    }, [data])

    const handleCategoryChange = (val: string) => {
        setCategoryFilter(val)
        setColumnFilters((prev) => {
            const next = prev.filter((f) => f.id !== "category")
            return val ? [...next, { id: "category", value: val }] : next
        })
    }

    const handleResetFilters = () => {
        setCategoryFilter("")
        setColumnFilters([])
    }

    const isFiltered = Boolean(categoryFilter)

    const table = useTable({
        features,
        data,
        columns,
        state: {
            columnFilters,
        },
        onColumnFiltersChange: setColumnFilters,
    })

    const filteredRowsCount = table.getFilteredRowModel().rows.length
    const totalRowsCount = data.length

    return (
        <div className="flex flex-col gap-4">
            {/* Filter Toolbar */}
            <div className="flex flex-col gap-3 rounded-lg border bg-card/50 p-3 shadow-xs">
                <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Filter className="h-4 w-4 text-primary" />
                        <span>Filter Categories</span>
                        {isFiltered && (
                            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                                Active
                            </span>
                        )}
                    </div>
                    {isFiltered && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleResetFilters}
                            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                        >
                            <RotateCcw className="mr-1 h-3 w-3" />
                            Reset
                        </Button>
                    )}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-4">
                    {/* Category Filter */}
                    <div className="flex flex-col gap-1 sm:min-w-[240px]">
                        <label className="text-xs font-medium text-muted-foreground">Category</label>
                        <select
                            value={categoryFilter}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                            className="h-9 w-full min-w-0 rounded-md border border-input bg-background px-2.5 py-1 text-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                        >
                            <option value="">All Categories</option>
                            {availableCategories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center text-xs text-muted-foreground">
                        <span>
                            Showing <strong className="font-semibold text-foreground">{filteredRowsCount}</strong> of{" "}
                            <strong className="font-semibold text-foreground">{totalRowsCount}</strong> entries
                            {isFiltered && (
                                <span className="ml-1 text-muted-foreground">
                                    (filtered)
                                </span>
                            )}
                        </span>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="max-h-[75vh] overflow-auto rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder ? null : (
                                                <table.FlexRender header={header} />
                                            )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            <table.FlexRender cell={cell} />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                                    {isFiltered
                                        ? "No categories match the selected filter."
                                        : "No categories found."}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}