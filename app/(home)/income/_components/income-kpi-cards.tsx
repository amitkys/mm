"use client";

import { useMemo } from "react";
import { type Income } from "../query/get";
import { type ExpansesLog } from "@/app/(home)/expanses-log/query/get";
import { Card, CardContent } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  DollarSign,
  PieChart,
  PiggyBank,
} from "lucide-react";

interface IncomeKpiCardsProps {
  incomeLogs: Income[];
  expenseLogs: ExpansesLog[];
}

export function IncomeKpiCards({ incomeLogs, expenseLogs }: IncomeKpiCardsProps) {
  const analytics = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // 1. Current Month vs Previous Month Income
    let currentMonthTotal = 0;
    let prevMonthTotal = 0;
    let totalAllTime = 0;

    const sourceCounts: Record<string, number> = {};

    incomeLogs.forEach((item) => {
      const amt = Number(item.amount) || 0;
      totalAllTime += amt;

      if (item.source) {
        sourceCounts[item.source] = (sourceCounts[item.source] || 0) + amt;
      }

      if (item.date) {
        const d = new Date(item.date);
        if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
          currentMonthTotal += amt;
        } else {
          // Determine previous month
          const targetPrevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
          const targetPrevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          if (d.getFullYear() === targetPrevYear && d.getMonth() === targetPrevMonth) {
            prevMonthTotal += amt;
          }
        }
      }
    });

    // MoM Growth % calculation
    let momGrowth = 0;
    let hasPrevMonthData = false;
    if (prevMonthTotal > 0) {
      momGrowth = ((currentMonthTotal - prevMonthTotal) / prevMonthTotal) * 100;
      hasPrevMonthData = true;
    } else if (currentMonthTotal > 0) {
      momGrowth = 100;
      hasPrevMonthData = false;
    }

    // Top Source
    let topSource = "N/A";
    let topSourceAmount = 0;
    Object.entries(sourceCounts).forEach(([src, sum]) => {
      if (sum > topSourceAmount) {
        topSourceAmount = sum;
        topSource = src;
      }
    });
    const topSourcePercentage =
      totalAllTime > 0 ? ((topSourceAmount / totalAllTime) * 100).toFixed(0) : "0";

    // Expenses tagged to income
    const totalExpensesTagged = expenseLogs.reduce(
      (sum, exp) => sum + (Number(exp.amount) || 0),
      0
    );
    const netRetained = totalAllTime - totalExpensesTagged;
    const spentPercentage =
      totalAllTime > 0 ? Math.min(100, Math.round((totalExpensesTagged / totalAllTime) * 100)) : 0;

    return {
      currentMonthTotal,
      prevMonthTotal,
      momGrowth,
      hasPrevMonthData,
      totalAllTime,
      totalEntries: incomeLogs.length,
      topSource,
      topSourceAmount,
      topSourcePercentage,
      totalExpensesTagged,
      netRetained,
      spentPercentage,
    };
  }, [incomeLogs, expenseLogs]);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {/* Card 1: Total Monthly Income & MoM Growth */}
      <Card className="bg-card/70 backdrop-blur-xs border-border/80 shadow-xs">
        <CardContent className="p-4 flex flex-col justify-between h-full gap-2">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>This Month Income</span>
            <div className="rounded-md bg-primary/10 p-1.5 text-primary">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-foreground">
              ₹{analytics.currentMonthTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs">
              {analytics.momGrowth >= 0 ? (
                <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded-sm">
                  <TrendingUp className="h-3 w-3" />
                  +{analytics.momGrowth.toFixed(1)}%
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 text-rose-600 dark:text-rose-400 font-semibold bg-rose-500/10 px-1.5 py-0.5 rounded-sm">
                  <TrendingDown className="h-3 w-3" />
                  {analytics.momGrowth.toFixed(1)}%
                </span>
              )}
              <span className="text-muted-foreground">
                vs last mo (₹{analytics.prevMonthTotal.toLocaleString("en-IN")})
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Total All-Time Income */}
      <Card className="bg-card/70 backdrop-blur-xs border-border/80 shadow-xs">
        <CardContent className="p-4 flex flex-col justify-between h-full gap-2">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Total Received (All Time)</span>
            <div className="rounded-md bg-blue-500/10 p-1.5 text-blue-500">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-foreground">
              ₹{analytics.totalAllTime.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Across <strong className="text-foreground">{analytics.totalEntries}</strong> income records
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Top Income Source */}
      <Card className="bg-card/70 backdrop-blur-xs border-border/80 shadow-xs">
        <CardContent className="p-4 flex flex-col justify-between h-full gap-2">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Primary Income Source</span>
            <div className="rounded-md bg-purple-500/10 p-1.5 text-purple-500">
              <PieChart className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-foreground truncate">
              {analytics.topSource}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Contributes <strong className="text-foreground">{analytics.topSourcePercentage}%</strong> of total income
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 4: Net Retained Balance */}
      <Card className="bg-card/70 backdrop-blur-xs border-border/80 shadow-xs">
        <CardContent className="p-4 flex flex-col justify-between h-full gap-2">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Net Retained Cash</span>
            <div className="rounded-md bg-amber-500/10 p-1.5 text-amber-500">
              <PiggyBank className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-foreground">
              ₹{analytics.netRetained.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Spent <strong className="text-foreground">{analytics.spentPercentage}%</strong> of total income
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
