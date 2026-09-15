"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { type EnrichedIncome } from "../query/get";
import { type ExpansesLog } from "@/app/(home)/expanses-log/query/get";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  ExternalLink,
  Receipt,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Tag,
  PieChart,
} from "lucide-react";

interface IncomeExpansesLogSheetProps {
  incomeItem: EnrichedIncome | null;
  taggedLogs: ExpansesLog[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IncomeExpansesLogSheet({
  incomeItem,
  taggedLogs,
  open,
  onOpenChange,
}: IncomeExpansesLogSheetProps) {
  const isMobile = useIsMobile();
  const router = useRouter();

  const stats = useMemo(() => {
    if (!incomeItem) {
      return {
        received: 0,
        spent: 0,
        remaining: 0,
        percent: 0,
        categoryBreakdown: [],
        typeBreakdown: { NEED: 0, WANT: 0, INVESTMENT: 0 },
      };
    }

    const received = Number(incomeItem.amount) || 0;
    const spent = taggedLogs.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const remaining = received - spent;
    const percent = received > 0 ? Math.min(100, Math.round((spent / received) * 100)) : 0;

    // Category Breakdown
    const catMap: Record<string, number> = {};
    const typeMap = { NEED: 0, WANT: 0, INVESTMENT: 0 };

    taggedLogs.forEach((log) => {
      const amt = Number(log.amount) || 0;
      if (log.category) {
        catMap[log.category] = (catMap[log.category] || 0) + amt;
      }
      if (log.type && log.type in typeMap) {
        typeMap[log.type as keyof typeof typeMap] += amt;
      }
    });

    const categoryBreakdown = Object.entries(catMap)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: spent > 0 ? Math.round((amount / spent) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      received,
      spent,
      remaining,
      percent,
      categoryBreakdown,
      typeBreakdown: typeMap,
    };
  }, [incomeItem, taggedLogs]);

  if (!incomeItem) return null;

  const isOverspent = stats.remaining < 0;

  const handleNavigateToExpenseLogs = () => {
    onOpenChange(false);
    const query = incomeItem.name ? `?search=${encodeURIComponent(incomeItem.name)}` : "";
    router.push(`/expanses-log${query}`);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className="p-6 data-[side=right]:sm:max-w-2xl lg:data-[side=right]:max-w-3xl overflow-y-auto max-h-screen"
      >
        <SheetHeader className="mb-4 p-0 pr-10">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            <SheetTitle className="flex items-center gap-2 text-base sm:text-lg">
              Tagged Expense Logs
              <Badge variant="outline" className="font-mono text-xs text-primary">
                {incomeItem.name}
              </Badge>
            </SheetTitle>
          </div>
          <SheetDescription>
            Expense entries tagged to this income record ({incomeItem.source} deposited to {incomeItem.depositedTo}).
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 py-2">
          {/* KPI Header Cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border bg-card p-3 shadow-xs flex flex-col gap-1">
              <span className="text-xs text-muted-foreground font-medium">Received Income</span>
              <span className="text-lg font-bold text-foreground">
                ₹{stats.received.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="rounded-lg border bg-card p-3 shadow-xs flex flex-col gap-1">
              <span className="text-xs text-muted-foreground font-medium">Total Tagged Spent</span>
              <span className="text-lg font-bold text-foreground">
                ₹{stats.spent.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="rounded-lg border bg-card p-3 shadow-xs flex flex-col gap-1">
              <span className="text-xs text-muted-foreground font-medium">Remaining Balance</span>
              <div className="flex items-center justify-between">
                <span className={`text-lg font-bold ${isOverspent ? "text-rose-500" : "text-emerald-600 dark:text-emerald-400"}`}>
                  ₹{stats.remaining.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
                <span className="text-xs font-mono font-medium text-muted-foreground">
                  {stats.percent}% spent
                </span>
              </div>
            </div>
          </div>

          {/* Utilization Bar */}
          <div className="flex flex-col gap-1.5 rounded-lg border bg-muted/30 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground flex items-center gap-1.5">
                {isOverspent ? (
                  <AlertCircle className="h-4 w-4 text-rose-500" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                )}
                Income Pool Status
              </span>
              <span className="text-muted-foreground font-mono">
                {stats.spent.toLocaleString("en-IN")} / {stats.received.toLocaleString("en-IN")} ₹
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full transition-all ${
                  isOverspent
                    ? "bg-rose-500"
                    : stats.percent > 85
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
                style={{ width: `${Math.min(100, stats.percent)}%` }}
              />
            </div>
          </div>

          {/* Category & Type Distribution Section */}
          {stats.categoryBreakdown.length > 0 && (
            <div className="flex flex-col gap-3 rounded-lg border p-4 bg-muted/20">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <PieChart className="h-4 w-4 text-primary" />
                <span>Spending Breakdown for {incomeItem.name}</span>
              </div>

              {/* Category Breakdown list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {stats.categoryBreakdown.map((item) => (
                  <div key={item.category} className="flex flex-col gap-1 rounded-md border bg-card p-2.5 text-xs">
                    <div className="flex items-center justify-between font-medium">
                      <span>{item.category}</span>
                      <span className="font-mono text-muted-foreground">{item.percentage}%</span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                      <span>₹{item.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Spending Type Pills */}
              <div className="flex items-center gap-2 pt-1 border-t border-border/50 text-xs">
                <span className="text-muted-foreground text-[11px]">Type Split:</span>
                <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-600 dark:text-blue-400">
                  NEED: ₹{stats.typeBreakdown.NEED.toLocaleString("en-IN")}
                </span>
                <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                  WANT: ₹{stats.typeBreakdown.WANT.toLocaleString("en-IN")}
                </span>
                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  INVESTMENT: ₹{stats.typeBreakdown.INVESTMENT.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          )}

          {/* Tagged Expense Logs Table */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Tag className="h-4 w-4 text-primary" />
                Tagged Expense Entries ({taggedLogs.length})
              </span>
            </div>

            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Category</TableHead>
                    <TableHead className="text-xs">Description</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taggedLogs.length > 0 ? (
                    taggedLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs">
                          {log.date
                            ? new Date(log.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })
                            : "-"}
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="flex flex-col">
                            <span className="font-medium">{log.category}</span>
                            {log.subCategory && (
                              <span className="text-[10px] text-muted-foreground">
                                {log.subCategory}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs max-w-[150px] truncate">
                          {log.description || "-"}
                        </TableCell>
                        <TableCell className="text-xs">
                          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">
                            {log.type}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-right font-bold">
                          ₹{Number(log.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-20 text-center text-xs text-muted-foreground">
                        No expense logs have been tagged to this income record yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <SheetFooter className="mt-6 flex-row justify-between gap-2 p-0">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button size="sm" onClick={handleNavigateToExpenseLogs}>
            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
            Open in Expense Logs Route
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
