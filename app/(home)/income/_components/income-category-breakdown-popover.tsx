"use client";

import { useMemo, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { type EnrichedIncome } from "../query/get";
import { type ExpansesLog } from "@/app/(home)/expanses-log/query/get";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { PieChart, ArrowUpRight, ExternalLink } from "lucide-react";

interface IncomeCategoryBreakdownPopoverProps {
  incomeItem: EnrichedIncome;
  taggedLogs: ExpansesLog[];
  children: ReactNode;
  onViewLogsClick?: () => void;
}

export function IncomeCategoryBreakdownPopover({
  incomeItem,
  taggedLogs,
  children,
  onViewLogsClick,
}: IncomeCategoryBreakdownPopoverProps) {
  const router = useRouter();

  const breakdown = useMemo(() => {
    const received = Number(incomeItem.amount) || 0;
    const spent = taggedLogs.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const remaining = received - spent;
    const percent = received > 0 ? Math.min(100, Math.round((spent / received) * 100)) : 0;

    // Group by Category
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

    const categories = Object.entries(catMap)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: spent > 0 ? Math.round((amount / spent) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      received,
      spent,
      remaining,
      percent,
      categories,
      types: typeMap,
    };
  }, [incomeItem, taggedLogs]);

  const handleNavigate = (params: { category?: string; type?: string }) => {
    const query = new URLSearchParams();
    if (incomeItem.name) {
      query.set("search", incomeItem.name);
    }
    if (params.category) {
      query.set("category", params.category);
    }
    if (params.type) {
      query.set("type", params.type);
    }
    router.push(`/expanses-log?${query.toString()}`);
  };

  return (
    <TooltipProvider delay={150}>
      <Tooltip>
        <TooltipTrigger
          onClick={(e) => {
            e.stopPropagation();
            onViewLogsClick?.();
          }}
          className="text-left cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-md"
        >
          {children}
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="w-76 p-3 bg-card border border-border text-foreground shadow-2xl rounded-xl"
        >
          <div className="flex flex-col gap-2.5">
            {/* Header */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleNavigate({});
              }}
              className="flex items-center justify-between border-b border-border/60 pb-2 cursor-pointer hover:text-primary transition-colors group"
              title="Open expense logs for this income tag"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <PieChart className="h-3.5 w-3.5 text-primary group-hover:scale-110 transition-transform" />
                <span>Category Breakdown ({incomeItem.name})</span>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground group-hover:text-primary">
                {breakdown.percent}% spent
              </span>
            </div>

            {/* Summary Row */}
            <div className="flex items-center justify-between text-xs bg-muted/40 p-2 rounded-md font-mono">
              <div>
                <span className="text-muted-foreground text-[10px]">Received:</span>{" "}
                <strong>₹{breakdown.received.toLocaleString("en-IN")}</strong>
              </div>
              <div>
                <span className="text-muted-foreground text-[10px]">Spent:</span>{" "}
                <strong className="text-rose-500">₹{breakdown.spent.toLocaleString("en-IN")}</strong>
              </div>
            </div>

            {/* Category breakdown list (Clickable rows) */}
            {breakdown.categories.length > 0 ? (
              <div className="flex flex-col gap-1 max-h-44 overflow-y-auto pr-0.5">
                {breakdown.categories.map((cat) => (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavigate({ category: cat.name });
                    }}
                    className="flex items-center justify-between text-xs p-1.5 rounded-md hover:bg-primary/10 hover:text-primary transition-colors group w-full text-left"
                    title={`Click to filter Expense Logs by Category "${cat.name}"`}
                  >
                    <span className="truncate max-w-[130px] font-medium text-foreground group-hover:text-primary">
                      {cat.name}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-medium text-foreground group-hover:text-primary">
                        ₹{cat.amount.toLocaleString("en-IN")}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground group-hover:text-primary w-7 text-right">
                        {cat.percentage}%
                      </span>
                      <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground italic py-1 text-center">
                No expense logs tagged to this income tag yet.
              </p>
            )}

            {/* Type breakdown pills (Clickable pills) */}
            {breakdown.categories.length > 0 && (
              <div className="flex items-center justify-between gap-1 pt-2 border-t border-border/60 text-[10px]">
                <span className="text-muted-foreground font-medium shrink-0">Type:</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNavigate({ type: "NEED" });
                  }}
                  className="inline-flex items-center rounded-md bg-blue-500/10 px-1.5 py-0.5 font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-colors"
                  title="Filter by NEED"
                >
                  NEED: ₹{breakdown.types.NEED.toLocaleString("en-IN")}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNavigate({ type: "WANT" });
                  }}
                  className="inline-flex items-center rounded-md bg-amber-500/10 px-1.5 py-0.5 font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
                  title="Filter by WANT"
                >
                  WANT: ₹{breakdown.types.WANT.toLocaleString("en-IN")}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNavigate({ type: "INVESTMENT" });
                  }}
                  className="inline-flex items-center rounded-md bg-emerald-500/10 px-1.5 py-0.5 font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                  title="Filter by INVESTMENT"
                >
                  INV: ₹{breakdown.types.INVESTMENT.toLocaleString("en-IN")}
                </button>
              </div>
            )}

            {/* Footer hint */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                if (onViewLogsClick) {
                  onViewLogsClick();
                } else {
                  handleNavigate({});
                }
              }}
              className="text-[10px] text-primary font-medium flex items-center justify-end gap-1 pt-1 cursor-pointer hover:underline"
            >
              <span>Click to view details</span>
              <ArrowUpRight className="h-3 w-3" />
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

