"use client";

import { useState, useRef, useMemo } from "react";
import { useReactToPrint } from "react-to-print";
import { type ExpansesLog } from "../query/get";
import { useGetIncomeQuery } from "@/app/income/query/get";
import { useGetExpansesCategoryQuery } from "@/app/expanses-category/query/get";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Printer, Filter, Check, RotateCcw } from "lucide-react";

interface PrintExpansesLogReportSheetProps {
  logs: ExpansesLog[];
}

type DatePresetOption =
  | "ALL"
  | "THIS_WEEK"
  | "THIS_MONTH"
  | "THIS_YEAR"
  | "SPECIFIC_DATE"
  | "CUSTOM_RANGE";

interface ColumnToggles {
  date: boolean;
  incomeTag: boolean;
  category: boolean;
  subCategory: boolean;
  amount: boolean;
  paymentMethod: boolean;
  source: boolean;
  type: boolean;
  description: boolean;
}

const DEFAULT_COLUMNS: ColumnToggles = {
  date: true,
  incomeTag: true,
  category: true,
  subCategory: true,
  amount: true,
  paymentMethod: true,
  source: true,
  type: true,
  description: true,
};

export function PrintExpansesLogReportSheet({ logs }: PrintExpansesLogReportSheetProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const { data: incomeData } = useGetIncomeQuery();
  const { data: categoryData } = useGetExpansesCategoryQuery();

  // Filter States
  const [datePreset, setDatePreset] = useState<DatePresetOption>("ALL");
  const [specificDate, setSpecificDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [selectedIncomeId, setSelectedIncomeId] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [columnToggles, setColumnToggles] = useState<ColumnToggles>(DEFAULT_COLUMNS);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Expense_Log_Report_${new Date().toISOString().split("T")[0]}`,
  });

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set((categoryData ?? []).map((c) => c.category))).sort();
  }, [categoryData]);

  // Reset Filters
  const handleResetFilters = () => {
    setDatePreset("ALL");
    setSpecificDate(new Date().toISOString().split("T")[0]);
    setFromDate("");
    setToDate("");
    setSelectedIncomeId("");
    setSelectedCategory("");
    setColumnToggles(DEFAULT_COLUMNS);
  };

  // Toggle individual column
  const toggleColumn = (key: keyof ColumnToggles) => {
    setColumnToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Filter Logic
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const logDate = new Date(log.date);
      const now = new Date();

      // 1. Income Tag Filter
      if (selectedIncomeId === "UNASSIGNED") {
        if (log.incomeId !== null) return false;
      } else if (selectedIncomeId !== "") {
        if (log.incomeId !== selectedIncomeId) return false;
      }

      // 2. Category Filter
      if (selectedCategory !== "") {
        if (log.category !== selectedCategory) return false;
      }

      // 3. Date Filter
      if (datePreset === "SPECIFIC_DATE") {
        if (!specificDate) return true;
        const target = new Date(specificDate);
        return (
          logDate.getFullYear() === target.getFullYear() &&
          logDate.getMonth() === target.getMonth() &&
          logDate.getDate() === target.getDate()
        );
      }

      if (datePreset === "THIS_WEEK") {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        return logDate >= oneWeekAgo && logDate <= now;
      }

      if (datePreset === "THIS_MONTH") {
        return (
          logDate.getFullYear() === now.getFullYear() &&
          logDate.getMonth() === now.getMonth()
        );
      }

      if (datePreset === "THIS_YEAR") {
        return logDate.getFullYear() === now.getFullYear();
      }

      if (datePreset === "CUSTOM_RANGE") {
        if (fromDate) {
          const start = new Date(fromDate);
          start.setHours(0, 0, 0, 0);
          if (logDate < start) return false;
        }
        if (toDate) {
          const end = new Date(toDate);
          end.setHours(23, 59, 59, 999);
          if (logDate > end) return false;
        }
        return true;
      }

      return true;
    });
  }, [logs, datePreset, specificDate, fromDate, toDate, selectedIncomeId, selectedCategory]);

  // Statistics calculation
  const totalAmount = useMemo(() => {
    return filteredLogs.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [filteredLogs]);

  // Label descriptor for header
  const filterSummaryText = useMemo(() => {
    const parts: string[] = [];

    if (selectedIncomeId === "UNASSIGNED") {
      parts.push("Income Tag: Unassigned");
    } else if (selectedIncomeId) {
      const inc = (incomeData ?? []).find((i) => i.id === selectedIncomeId);
      parts.push(`Income Tag: ${inc ? `${inc.name} (${inc.source})` : selectedIncomeId}`);
    } else {
      parts.push("Income Tag: All Incomes");
    }

    if (datePreset === "ALL") parts.push("Period: All Time");
    else if (datePreset === "THIS_WEEK") parts.push("Period: This Week");
    else if (datePreset === "THIS_MONTH") parts.push("Period: This Month");
    else if (datePreset === "THIS_YEAR") parts.push("Period: This Year");
    else if (datePreset === "SPECIFIC_DATE") parts.push(`Date: ${specificDate}`);
    else if (datePreset === "CUSTOM_RANGE")
      parts.push(`Range: ${fromDate || "Start"} to ${toDate || "End"}`);

    if (selectedCategory) parts.push(`Category: ${selectedCategory}`);

    return parts.join(" | ");
  }, [datePreset, specificDate, fromDate, toDate, selectedIncomeId, selectedCategory, incomeData]);

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        <Printer className="h-4 w-4 mr-1.5" />
        Print Report
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side={isMobile ? "bottom" : "right"}
          className="p-6 data-[side=right]:sm:max-w-2xl lg:data-[side=right]:max-w-3xl overflow-y-auto max-h-screen"
        >
          <SheetHeader className="mb-4 p-0 pr-10">
            <div className="flex items-center justify-between gap-2">
              <SheetTitle className="flex items-center gap-2">
                <Printer className="h-5 w-5 text-primary" />
                Configure & Print Expense Report
              </SheetTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="text-xs text-muted-foreground hover:text-foreground shrink-0"
                title="Reset all filters and columns"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                Reset
              </Button>
            </div>
            <SheetDescription>
              Filter your expense logs and choose which columns to include in the generated print report.
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-6 py-2">
            {/* Section 1: Income Tag Filter */}
            <div className="flex flex-col gap-2 rounded-lg border p-4 bg-muted/30">
              <Label className="font-semibold text-sm flex items-center gap-1.5">
                <Filter className="h-4 w-4 text-primary" />
                1. Filter by Income Tag
              </Label>
              <select
                value={selectedIncomeId}
                onChange={(e) => setSelectedIncomeId(e.target.value)}
                className="h-9 w-full rounded-3xl border border-transparent bg-background px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
              >
                <option value="">All Incomes & Tags</option>
                <option value="UNASSIGNED">Unassigned Only (No Income Tag)</option>
                {(incomeData ?? []).map((inc) => (
                  <option key={inc.id} value={inc.id}>
                    {inc.name} ({inc.source} - ₹{inc.amount})
                  </option>
                ))}
              </select>
            </div>

            {/* Section 2: Date Range Configuration */}
            <div className="flex flex-col gap-3 rounded-lg border p-4 bg-muted/30">
              <Label className="font-semibold text-sm flex items-center gap-1.5">
                <Filter className="h-4 w-4 text-primary" />
                2. Filter by Date / Timeframe
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(
                  [
                    ["ALL", "All Time"],
                    ["THIS_WEEK", "This Week"],
                    ["THIS_MONTH", "This Month"],
                    ["THIS_YEAR", "This Year"],
                    ["SPECIFIC_DATE", "Specific Date"],
                    ["CUSTOM_RANGE", "Custom Range"],
                  ] as const
                ).map(([key, label]) => (
                  <Button
                    key={key}
                    type="button"
                    variant={datePreset === key ? "default" : "outline"}
                    size="sm"
                    className="text-xs"
                    onClick={() => setDatePreset(key)}
                  >
                    {datePreset === key && <Check className="h-3 w-3 mr-1" />}
                    {label}
                  </Button>
                ))}
              </div>

              {datePreset === "SPECIFIC_DATE" && (
                <div className="flex flex-col gap-1.5 mt-2">
                  <Label htmlFor="report-specific-date" className="text-xs">
                    Select Date
                  </Label>
                  <Input
                    id="report-specific-date"
                    type="date"
                    value={specificDate}
                    onChange={(e) => setSpecificDate(e.target.value)}
                  />
                </div>
              )}

              {datePreset === "CUSTOM_RANGE" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="report-from-date" className="text-xs">
                      From Date
                    </Label>
                    <Input
                      id="report-from-date"
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="report-to-date" className="text-xs">
                      To Date
                    </Label>
                    <Input
                      id="report-to-date"
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Category Filter */}
            <div className="flex flex-col gap-2 rounded-lg border p-4 bg-muted/30">
              <Label className="font-semibold text-sm flex items-center gap-1.5">
                <Filter className="h-4 w-4 text-primary" />
                3. Filter by Category (Optional)
              </Label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-9 w-full rounded-3xl border border-transparent bg-background px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
              >
                <option value="">All Categories</option>
                {uniqueCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Section 4: Select Visible Columns */}
            <div className="flex flex-col gap-3 rounded-lg border p-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <Label className="font-semibold text-sm">
                  4. Select Columns to Include in Print
                </Label>
                <span className="text-xs text-muted-foreground">
                  Check columns to render
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {(
                  [
                    ["date", "Date"],
                    ["incomeTag", "Tag / Income"],
                    ["category", "Category"],
                    ["subCategory", "Sub-Category"],
                    ["amount", "Amount"],
                    ["paymentMethod", "Payment Method"],
                    ["source", "Source"],
                    ["type", "Spending Type"],
                    ["description", "Description"],
                  ] as const
                ).map(([key, label]) => (
                  <label
                    key={key}
                    className={`flex items-center gap-2 rounded-md border p-2 text-xs cursor-pointer transition-colors ${
                      columnToggles[key]
                        ? "bg-primary/10 border-primary text-primary font-medium"
                        : "bg-background border-input text-muted-foreground"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={columnToggles[key]}
                      onChange={() => toggleColumn(key)}
                      className="rounded border-gray-300 text-primary focus:ring-primary h-3.5 w-3.5"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            {/* Section 5: Filtered Result Summary Preview */}
            <div className="rounded-lg border bg-card p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Matching Entries: <strong className="text-foreground font-semibold">{filteredLogs.length}</strong></span>
                <span>Total Amount: <strong className="text-foreground font-semibold">₹{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong></span>
              </div>
              <p className="text-xs text-muted-foreground italic border-t pt-2">
                Active Filter: {filterSummaryText}
              </p>
            </div>
          </div>

          <SheetFooter className="mt-6 flex-row justify-end gap-2 p-0">
            <SheetClose render={<Button type="button" variant="outline" />}>
              Cancel
            </SheetClose>
            <Button
              type="button"
              onClick={() => handlePrint()}
              disabled={filteredLogs.length === 0}
            >
              <Printer className="h-4 w-4 mr-1.5" />
              Print / Save PDF ({filteredLogs.length})
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Hidden Printable Area */}
      <div className="hidden">
        <div ref={printRef} className="p-4 bg-white text-black font-sans text-[11px] w-full">
          {/* Minimal Black & White Header */}
          <div className="border-b border-black pb-2 mb-3 flex items-end justify-between">
            <div>
              <h1 className="text-base font-bold uppercase tracking-wide text-black">
                Expense Log Report
              </h1>
              <p className="text-[10px] text-black font-mono mt-0.5">{filterSummaryText}</p>
            </div>
            <div className="text-right text-[10px] text-black">
              <p>Date: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}</p>
            </div>
          </div>

          {/* Compact B&W Summary Bar */}
          <div className="border border-black p-2 mb-3 flex items-center justify-between text-[11px] font-mono">
            <span>Total Transactions: <strong>{filteredLogs.length}</strong></span>
            <span>Total Amount: <strong>₹{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong></span>
          </div>

          {/* Simple Black & White Data Table */}
          {filteredLogs.length > 0 ? (
            <table className="w-full text-left border-collapse text-[10px] font-sans">
              <thead>
                <tr className="border-b border-black text-black uppercase font-bold text-[9px]">
                  {columnToggles.date && <th className="py-1 px-1.5">Date</th>}
                  {columnToggles.incomeTag && <th className="py-1 px-1.5">Tag / Income</th>}
                  {columnToggles.category && <th className="py-1 px-1.5">Category</th>}
                  {columnToggles.subCategory && <th className="py-1 px-1.5">Sub Category</th>}
                  {columnToggles.amount && <th className="py-1 px-1.5 text-right">Amount</th>}
                  {columnToggles.paymentMethod && <th className="py-1 px-1.5">Payment Method</th>}
                  {columnToggles.source && <th className="py-1 px-1.5">Source</th>}
                  {columnToggles.type && <th className="py-1 px-1.5">Type</th>}
                  {columnToggles.description && <th className="py-1 px-1.5">Description</th>}
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
                  const logDate = log.date
                    ? new Date(log.date).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "-";

                  const amtNum = Number(log.amount);
                  const formattedAmt = isNaN(amtNum)
                    ? log.amount
                    : `₹${amtNum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

                  return (
                    <tr key={log.id} className="border-b border-gray-300">
                      {columnToggles.date && <td className="py-1 px-1.5 font-medium">{logDate}</td>}
                      {columnToggles.incomeTag && (
                        <td className="py-1 px-1.5 font-mono text-[9px]">
                          {log.name || "-"}
                        </td>
                      )}
                      {columnToggles.category && <td className="py-1 px-1.5">{log.category}</td>}
                      {columnToggles.subCategory && (
                        <td className="py-1 px-1.5">{log.subCategory || "-"}</td>
                      )}
                      {columnToggles.amount && (
                        <td className="py-1 px-1.5 text-right font-bold">{formattedAmt}</td>
                      )}
                      {columnToggles.paymentMethod && (
                        <td className="py-1 px-1.5">{log.paymentMethod}</td>
                      )}
                      {columnToggles.source && (
                        <td className="py-1 px-1.5">{log.source || "-"}</td>
                      )}
                      {columnToggles.type && (
                        <td className="py-1 px-1.5 font-semibold">{log.type}</td>
                      )}
                      {columnToggles.description && (
                        <td className="py-1 px-1.5 max-w-[200px] truncate">
                          {log.description || "-"}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="py-4 text-center text-black text-[10px] border border-black">
              No expense entries matched the selected filter configuration.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
