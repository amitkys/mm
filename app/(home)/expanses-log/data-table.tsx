"use client"

import { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "next/navigation"
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
import {
    Search,
    Filter,
    RotateCcw,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react"

interface DataTableProps<TData extends RowData> {
    columns: ColumnDef<DataTableFeatures, TData>[]
    data: TData[]
}

export function DataTable<TData extends RowData>({
    columns,
    data,
}: DataTableProps<TData>) {
    const searchParams = useSearchParams()
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [sourceFilter, setSourceFilter] = useState<string>("")
    const [categoryFilter, setCategoryFilter] = useState<string>("")
    const [typeFilter, setTypeFilter] = useState<string>("")
    const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("")
    const [searchQuery, setSearchQuery] = useState<string>("")
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    })

    useEffect(() => {
        const paramSearch = searchParams?.get("search") || searchParams?.get("tag")
        const paramCategory = searchParams?.get("category")
        const paramType = searchParams?.get("type")
        const paramSource = searchParams?.get("source")
        const paramPaymentMethod = searchParams?.get("paymentMethod")

        let nextFilters: ColumnFiltersState = []

        if (paramSearch) {
            setSearchQuery(paramSearch)
            nextFilters.push({ id: "description", value: paramSearch })
        } else {
            setSearchQuery("")
        }

        if (paramCategory) {
            setCategoryFilter(paramCategory)
            nextFilters.push({ id: "category", value: paramCategory })
        } else {
            setCategoryFilter("")
        }

        if (paramType) {
            setTypeFilter(paramType)
            nextFilters.push({ id: "type", value: paramType })
        } else {
            setTypeFilter("")
        }

        if (paramSource) {
            setSourceFilter(paramSource)
            nextFilters.push({ id: "source", value: paramSource })
        } else {
            setSourceFilter("")
        }

        if (paramPaymentMethod) {
            setPaymentMethodFilter(paramPaymentMethod)
            nextFilters.push({ id: "paymentMethod", value: paramPaymentMethod })
        } else {
            setPaymentMethodFilter("")
        }

        setColumnFilters(nextFilters)
        setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    }, [searchParams])

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

    const resetPageIndex = () => {
        setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    }

    // Update column filters whenever controls change
    const handleSourceChange = (val: string) => {
        setSourceFilter(val)
        resetPageIndex()
        setColumnFilters((prev) => {
            const next = prev.filter((f) => f.id !== "source")
            return val ? [...next, { id: "source", value: val }] : next
        })
    }

    const handleCategoryChange = (val: string) => {
        setCategoryFilter(val)
        resetPageIndex()
        setColumnFilters((prev) => {
            const next = prev.filter((f) => f.id !== "category")
            return val ? [...next, { id: "category", value: val }] : next
        })
    }

    const handleTypeChange = (val: string) => {
        setTypeFilter(val)
        resetPageIndex()
        setColumnFilters((prev) => {
            const next = prev.filter((f) => f.id !== "type")
            return val ? [...next, { id: "type", value: val }] : next
        })
    }

    const handlePaymentMethodChange = (val: string) => {
        setPaymentMethodFilter(val)
        resetPageIndex()
        setColumnFilters((prev) => {
            const next = prev.filter((f) => f.id !== "paymentMethod")
            return val ? [...next, { id: "paymentMethod", value: val }] : next
        })
    }

    const handleSearchChange = (val: string) => {
        setSearchQuery(val)
        resetPageIndex()
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
        resetPageIndex()
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
            pagination,
        },
        onColumnFiltersChange: (updater) => {
            setColumnFilters(updater)
            resetPageIndex()
        },
        onPaginationChange: setPagination,
    })

    const filteredRowsCount = table.getFilteredRowModel().rows.length
    const totalRowsCount = data.length
    const pageIndex = pagination.pageIndex
    const pageSize = pagination.pageSize
    const isAll = pageSize >= (totalRowsCount || 1) && totalRowsCount > 0
    const startEntry = filteredRowsCount === 0 ? 0 : pageIndex * pageSize + 1
    const endEntry = Math.min((pageIndex + 1) * pageSize, filteredRowsCount)

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
                        Showing <strong className="font-semibold text-foreground">{startEntry}</strong> to{" "}
                        <strong className="font-semibold text-foreground">{endEntry}</strong> of{" "}
                        <strong className="font-semibold text-foreground">{filteredRowsCount}</strong> expense entries
                        {isFiltered && (
                            <span className="ml-1 text-muted-foreground">
                                (filtered from {totalRowsCount} total entries)
                            </span>
                        )}
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

            {/* Pagination Controls */}
            <div className="flex flex-col-reverse items-center justify-between gap-4 px-1 py-2 sm:flex-row">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Rows per page</span>
                    <select
                        value={isAll ? "all" : pageSize}
                        onChange={(e) => {
                            if (e.target.value === "all") {
                                table.setPageSize(totalRowsCount > 0 ? totalRowsCount : 999999)
                            } else {
                                table.setPageSize(Number(e.target.value))
                            }
                        }}
                        className="h-8 rounded-md border border-input bg-background px-2 py-1 text-xs font-medium outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                    >
                        {[10, 20, 30, 50, 100].map((size) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                        <option value="all">All ({totalRowsCount})</option>
                    </select>
                    <span className="hidden sm:inline-block">
                        Showing <strong className="font-semibold text-foreground">{startEntry}</strong>–
                        <strong className="font-semibold text-foreground">{endEntry}</strong> of{" "}
                        <strong className="font-semibold text-foreground">{filteredRowsCount}</strong> entries
                    </span>
                </div>

                <div className="flex items-center gap-4 sm:gap-6">
                    <div className="flex items-center justify-center text-xs font-medium text-foreground">
                        Page {table.getPageCount() === 0 ? 0 : pageIndex + 1} of {table.getPageCount()}
                    </div>
                    <div className="flex items-center space-x-1">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => table.firstPage()}
                            disabled={!table.getCanPreviousPage()}
                            title="First page"
                        >
                            <ChevronsLeft className="h-4 w-4" />
                            <span className="sr-only">Go to first page</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2.5 text-xs"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2.5 text-xs"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            Next
                            <ChevronRight className="ml-1 h-3.5 w-3.5" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => table.lastPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <ChevronsRight className="h-4 w-4" />
                            <span className="sr-only">Go to last page</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}


