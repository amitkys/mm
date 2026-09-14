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
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { features, type DataTableFeatures } from "./data-table-feature"
import { Search, Filter, RotateCcw, Tag } from "lucide-react"

interface DataTableProps<TData extends RowData> {
    columns: ColumnDef<DataTableFeatures, TData>[]
    data: TData[]
}

export function DataTable<TData extends RowData>({
    columns,
    data,
}: DataTableProps<TData>) {
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [sourceFilter, setSourceFilter] = useState<string>("")
    const [categoryFilter, setCategoryFilter] = useState<string>("")
    const [typeFilter, setTypeFilter] = useState<string>("")
    const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("")
    const [searchQuery, setSearchQuery] = useState<string>("")

    // Extract dynamic unique values from data
    const availableSources = useMemo(() => {
        const defaultSources = [
            "Salary",
            "Freelance/Business",
            "Friend Repayment",
            "Interest/Dividends",
            "Refund",
            "ATM Withdrawal",
            "Other",
        ]
        const dataSources = (data as any[])
            .map((item) => item.source)
            .filter((s): s is string => Boolean(s))
        return Array.from(new Set([...defaultSources, ...dataSources])).sort()
    }, [data])

    const availableCategories = useMemo(() => {
        const cats = (data as any[])
            .map((item) => item.category)
            .filter((c): c is string => Boolean(c))
        return Array.from(new Set(cats)).sort()
    }, [data])

    // Update column filters whenever controls change
    const handleSourceChange = (val: string) => {
        setSourceFilter(val)
        setColumnFilters((prev) => {
            const next = prev.filter((f) => f.id !== "source")
            return val ? [...next, { id: "source", value: val }] : next
        })
    }

    const handleCategoryChange = (val: string) => {
        setCategoryFilter(val)
        setColumnFilters((prev) => {
            const next = prev.filter((f) => f.id !== "category")
            return val ? [...next, { id: "category", value: val }] : next
        })
    }

    const handleTypeChange = (val: string) => {
        setTypeFilter(val)
        setColumnFilters((prev) => {
            const next = prev.filter((f) => f.id !== "type")
            return val ? [...next, { id: "type", value: val }] : next
        })
    }

    const handlePaymentMethodChange = (val: string) => {
        setPaymentMethodFilter(val)
        setColumnFilters((prev) => {
            const next = prev.filter((f) => f.id !== "paymentMethod")
            return val ? [...next, { id: "paymentMethod", value: val }] : next
        })
    }

    const handleSearchChange = (val: string) => {
        setSearchQuery(val)
        setColumnFilters((prev) => {
            const next = prev.filter((f) => f.id !== "description")
            return val ? [...next, { id: "description", value: val }] : next
        })
    }

    const handleResetFilters = () => {
        setSourceFilter("")
        setCategoryFilter("")
        setTypeFilter("")
        setPaymentMethodFilter("")
        setSearchQuery("")
        setColumnFilters([])
    }

    const isFiltered =
        Boolean(sourceFilter) ||
        Boolean(categoryFilter) ||
        Boolean(typeFilter) ||
        Boolean(paymentMethodFilter) ||
        Boolean(searchQuery)

    const table = useTable({
        features,
        data,
        columns,
        state: {
            columnFilters,
        },
        onColumnFiltersChange: setColumnFilters,
    })

    const filteredRowsCount = table.getRowModel().rows.length
    const totalRowsCount = data.length

    return (
        <div className="flex flex-col gap-4">
            {/* Filter Toolbar */}
            <div className="flex flex-col gap-3 rounded-lg border bg-card/50 p-3 shadow-xs">
                <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Filter className="h-4 w-4 text-primary" />
                        <span>Filter Expense Logs</span>
                        {isFiltered && (
                            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                                Active Filters
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
                            Reset Filters
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
                    {/* Source Filter */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-muted-foreground">Source</label>
                        <select
                            value={sourceFilter}
                            onChange={(e) => handleSourceChange(e.target.value)}
                            className="h-9 w-full min-w-0 rounded-md border border-input bg-background px-2.5 py-1 text-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                        >
                            <option value="">All Sources</option>
                            {availableSources.map((src) => (
                                <option key={src} value={src}>
                                    {src}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Category Filter */}
                    <div className="flex flex-col gap-1">
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

                    {/* Spending Type Filter */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-muted-foreground">Spending Type</label>
                        <select
                            value={typeFilter}
                            onChange={(e) => handleTypeChange(e.target.value)}
                            className="h-9 w-full min-w-0 rounded-md border border-input bg-background px-2.5 py-1 text-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                        >
                            <option value="">All Types</option>
                            <option value="NEED">NEED</option>
                            <option value="WANT">WANT</option>
                            <option value="INVESTMENT">INVESTMENT</option>
                        </select>
                    </div>

                    {/* Payment Method Filter */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-muted-foreground">Payment Method</label>
                        <select
                            value={paymentMethodFilter}
                            onChange={(e) => handlePaymentMethodChange(e.target.value)}
                            className="h-9 w-full min-w-0 rounded-md border border-input bg-background px-2.5 py-1 text-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                        >
                            <option value="">All Methods</option>
                            <option value="DEBIT CARD">DEBIT CARD</option>
                            <option value="CREDIT CARD">CREDIT CARD</option>
                            <option value="UPI">UPI</option>
                            <option value="CASH">CASH</option>
                            <option value="NET BANKING">NET BANKING</option>
                            <option value="OTHER">OTHER</option>
                        </select>
                    </div>

                    {/* Search Input */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-muted-foreground">Search Description</label>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="h-9 pl-8 text-xs"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <span>
                        Showing <strong className="text-foreground font-semibold">{filteredRowsCount}</strong> of{" "}
                        <strong className="text-foreground font-semibold">{totalRowsCount}</strong> expense entries
                    </span>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-md border">
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
                                        ? "No expense logs match the selected filters."
                                        : "No expense logs found."}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

