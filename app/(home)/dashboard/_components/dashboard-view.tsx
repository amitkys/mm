"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useGetDashboardQuery, type DashboardData } from "../query/get";
import { useGetDashboardTagsQuery } from "../query/get-tags";

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });
const shortMoney = new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 });
const trendConfig = {
  income: { label: "Earned income", color: "var(--chart-2)" },
  outflow: { label: "Outflow", color: "var(--chart-5)" },
} satisfies ChartConfig;
const categoryConfig = { amount: { label: "Spending", color: "var(--chart-3)" } } satisfies ChartConfig;
const typeConfig = {
  NEED: { label: "Needs", color: "var(--chart-2)" },
  WANT: { label: "Wants", color: "var(--chart-4)" },
  INVESTMENT: { label: "Investments", color: "var(--chart-1)" },
} satisfies ChartConfig;

function changeLabel(change: number | null) {
  return change === null ? "No prior-month comparison" : `${change >= 0 ? "+" : ""}${change.toFixed(1)}% vs previous month`;
}

function moneyTooltip(value: unknown, name: string | number | undefined, label: string) {
  return <div className="flex w-full justify-between gap-4"><span className="text-muted-foreground">{label || name}</span><span className="font-medium tabular-nums">{money.format(Number(value))}</span></div>;
}

function SummaryCard({ title, value, description }: { title: string; value: number; description: string }) {
  return (
    <Card className="min-w-0">
      <CardHeader className="pb-3">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="break-words text-2xl tabular-nums">{money.format(value)}</CardTitle>
      </CardHeader>
      <CardContent className="text-xs text-muted-foreground">{description}</CardContent>
    </Card>
  );
}

function DashboardContent({ data }: { data: DashboardData }) {
  const { summary, trend, categories, spendingTypes, recentActivity } = data;
  const topCategories = categories.slice(0, 5);
  const extraCategories = categories.slice(5).reduce((sum, item) => sum + item.amount, 0);
  const categoryChart = extraCategories ? [...topCategories, { category: "Other", amount: extraCategories, percentage: 0 }] : topCategories;
  const nonzeroTypes = spendingTypes.filter((item) => item.amount > 0);

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Earned income" value={summary.income} description={changeLabel(summary.incomeChangePercent)} />
        <SummaryCard title="Spending" value={summary.spending} description={`${changeLabel(summary.spendingChangePercent)} · Needs + wants`} />
        <SummaryCard title="Investments" value={summary.investment} description="Recorded investment outflow" />
        <SummaryCard title="Net recorded flow" value={summary.netFlow} description="Income + reimbursements − spending − investments" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="min-w-0 lg:col-span-2">
          <CardHeader><CardTitle>Six-month cash flow</CardTitle><CardDescription>Earned income versus all recorded expense outflow, ending in the selected month.</CardDescription></CardHeader>
          <CardContent>
            <ChartContainer config={trendConfig} className="h-72 w-full aspect-auto">
              <BarChart data={trend} accessibilityLayer margin={{ left: 4, right: 4 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickFormatter={(value: number) => shortMoney.format(value)} tickLine={false} axisLine={false} width={55} />
                <ChartTooltip content={<ChartTooltipContent formatter={(value, name) => moneyTooltip(value, name, name === "income" ? "Earned income" : "Outflow")} />} />
                <Bar dataKey="income" fill="var(--color-income)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="outflow" fill="var(--color-outflow)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
              <span><span className="mr-2 inline-block size-2 rounded-sm bg-[var(--chart-2)]" />Earned income</span>
              <span><span className="mr-2 inline-block size-2 rounded-sm bg-[var(--chart-5)]" />Spending + investments</span>
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader><CardTitle>Money movement</CardTitle><CardDescription>Items kept separate from earned income.</CardDescription></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3 border-b pb-3"><span className="text-sm text-muted-foreground">Reimbursements</span><span className="font-medium tabular-nums">{money.format(summary.reimbursement)}</span></div>
            <div className="flex items-center justify-between gap-3 border-b pb-3"><span className="text-sm text-muted-foreground">Transfers</span><span className="font-medium tabular-nums">{money.format(summary.transfer)}</span></div>
            <div className="flex items-center justify-between gap-3"><span className="text-sm text-muted-foreground">Total outflow</span><span className="font-medium tabular-nums">{money.format(summary.outflow)}</span></div>
            <p className="text-xs leading-relaxed text-muted-foreground">Transfers are shown for visibility but excluded from net flow. This is not an account balance.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="min-w-0">
          <CardHeader><CardTitle>Top spending categories</CardTitle><CardDescription>Needs and wants only, for the selected month.</CardDescription></CardHeader>
          <CardContent>
            {categoryChart.length ? (
              <ChartContainer config={categoryConfig} className="h-72 w-full aspect-auto">
                <BarChart data={categoryChart} layout="vertical" accessibilityLayer margin={{ left: 0, right: 8 }}>
                  <CartesianGrid horizontal={false} />
                  <YAxis dataKey="category" type="category" tickLine={false} axisLine={false} width={105} tick={{ fontSize: 11 }} />
                  <XAxis type="number" tickFormatter={(value: number) => shortMoney.format(value)} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent formatter={(value, name) => moneyTooltip(value, name, "Spending")} />} />
                  <Bar dataKey="amount" fill="var(--color-amount)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            ) : <p className="flex h-72 items-center justify-center text-sm text-muted-foreground">No spending in this month.</p>}
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader><CardTitle>Outflow breakdown</CardTitle><CardDescription>How needs, wants, and investments contribute to outflow.</CardDescription></CardHeader>
          <CardContent>
            {nonzeroTypes.length ? (
              <>
                <ChartContainer config={typeConfig} className="mx-auto h-56 w-full max-w-sm aspect-auto">
                  <PieChart accessibilityLayer>
                    <ChartTooltip content={<ChartTooltipContent hideLabel formatter={(value, name) => moneyTooltip(value, name, typeConfig[String(name) as keyof typeof typeConfig]?.label ?? String(name))} />} />
                    <Pie data={nonzeroTypes} dataKey="amount" nameKey="type" innerRadius={58} outerRadius={88} strokeWidth={2}>
                      {nonzeroTypes.map((item) => <Cell key={item.type} fill={`var(--color-${item.type})`} />)}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className="space-y-2">
                  {spendingTypes.map((item) => (
                    <div key={item.type} className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex items-center gap-2"><span className="size-2.5 rounded-sm" style={{ backgroundColor: `var(--chart-${item.type === "NEED" ? 2 : item.type === "WANT" ? 4 : 1})` }} />{typeConfig[item.type].label}</span>
                      <span className="tabular-nums">{money.format(item.amount)} <span className="text-muted-foreground">({item.percentage.toFixed(0)}%)</span></span>
                    </div>
                  ))}
                </div>
              </>
            ) : <p className="flex h-72 items-center justify-center text-sm text-muted-foreground">No outflow in this month.</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent activity</CardTitle><CardDescription>Latest entries in the selected month.</CardDescription></CardHeader>
        <CardContent>
          {recentActivity.length ? <div className="divide-y">
            {recentActivity.map((item) => (
              <Link key={`${item.kind}-${item.id}`} href={item.kind === "income" ? "/income" : "/expanses-log"} className="flex items-center justify-between gap-4 py-3 transition-colors hover:text-primary">
                <div className="min-w-0"><p className="truncate text-sm font-medium">{item.title}</p><p className="text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" })} · {item.detail}</p></div>
                <span className="shrink-0 text-sm font-medium tabular-nums">{item.kind === "expense" ? "−" : "+"}{money.format(item.amount)}</span>
              </Link>
            ))}
          </div> : <p className="py-10 text-center text-sm text-muted-foreground">No activity in this month.</p>}
        </CardContent>
      </Card>
    </div>
  );
}

type TagInsight = NonNullable<DashboardData["tagInsight"]>;

function TagDashboardContent({ insight }: { insight: TagInsight }) {
  const { tag, summary, categories, spendingTypes, recentExpenses } = insight;
  const topCategories = categories.slice(0, 5);
  const extraCategories = categories.slice(5).reduce((sum, item) => sum + item.amount, 0);
  const categoryChart = extraCategories
    ? [...topCategories, { category: "Other", amount: extraCategories, percentage: 0 }]
    : topCategories;
  const nonzeroTypes = spendingTypes.filter((item) => item.amount > 0);

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="min-w-0">
        <h2 className="truncate text-lg font-semibold">{tag.name}</h2>
        <p className="text-sm text-muted-foreground">
          {tag.type} · {tag.source} · {new Date(tag.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">Amounts below include every expense linked to this tag, regardless of expense month.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Received amount" value={summary.received} description={`This tag is recorded as ${tag.type.toLowerCase()}`} />
        <SummaryCard title="Linked spending" value={summary.spending} description="Needs + wants, across all dates" />
        <SummaryCard title="Linked investments" value={summary.investment} description="Investment entries linked to this tag" />
        <SummaryCard title="Remaining on tag" value={summary.remaining} description="Received − all linked expenses" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="min-w-0 lg:col-span-2">
          <CardHeader><CardTitle>Where this tag went</CardTitle><CardDescription>Top categories across all linked expenses, including investments.</CardDescription></CardHeader>
          <CardContent>
            {categoryChart.length ? (
              <ChartContainer config={categoryConfig} className="h-72 w-full aspect-auto">
                <BarChart data={categoryChart} layout="vertical" accessibilityLayer margin={{ left: 0, right: 8 }}>
                  <CartesianGrid horizontal={false} />
                  <YAxis dataKey="category" type="category" tickLine={false} axisLine={false} width={105} tick={{ fontSize: 11 }} />
                  <XAxis type="number" tickFormatter={(value: number) => shortMoney.format(value)} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent formatter={(value, name) => moneyTooltip(value, name, "Linked outflow")} />} />
                  <Bar dataKey="amount" fill="var(--color-amount)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            ) : <p className="flex h-72 items-center justify-center text-sm text-muted-foreground">No expenses linked to this tag.</p>}
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader><CardTitle>Allocation details</CardTitle><CardDescription>Received amount minus linked outflow.</CardDescription></CardHeader>
          <CardContent className="flex flex-col gap-4 text-sm">
            <div className="flex justify-between gap-3"><span className="text-muted-foreground">Total linked outflow</span><span className="tabular-nums">{money.format(summary.outflow)}</span></div>
            <div className="flex justify-between gap-3"><span className="text-muted-foreground">Linked outflow in selected month</span><span className="tabular-nums">{money.format(summary.selectedMonthOutflow)}</span></div>
            <div className="flex justify-between gap-3"><span className="text-muted-foreground">Linked expense entries</span><span className="tabular-nums">{summary.expenseCount}</span></div>
            <p className="text-xs leading-relaxed text-muted-foreground">Remaining is a tag allocation, not a bank-account balance. It can be negative if linked expenses exceed the received amount.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="min-w-0">
          <CardHeader><CardTitle>Linked outflow breakdown</CardTitle><CardDescription>Needs, wants, and investments across all dates.</CardDescription></CardHeader>
          <CardContent>
            {nonzeroTypes.length ? (
              <>
                <ChartContainer config={typeConfig} className="mx-auto h-56 w-full max-w-sm aspect-auto">
                  <PieChart accessibilityLayer>
                    <ChartTooltip content={<ChartTooltipContent hideLabel formatter={(value, name) => moneyTooltip(value, name, typeConfig[String(name) as keyof typeof typeConfig]?.label ?? String(name))} />} />
                    <Pie data={nonzeroTypes} dataKey="amount" nameKey="type" innerRadius={58} outerRadius={88} strokeWidth={2}>
                      {nonzeroTypes.map((item) => <Cell key={item.type} fill={`var(--color-${item.type})`} />)}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className="flex flex-col gap-2">
                  {spendingTypes.map((item) => (
                    <div key={item.type} className="flex items-center justify-between gap-3 text-sm">
                      <span>{typeConfig[item.type].label}</span>
                      <span className="tabular-nums">{money.format(item.amount)} <span className="text-muted-foreground">({item.percentage.toFixed(0)}%)</span></span>
                    </div>
                  ))}
                </div>
              </>
            ) : <p className="flex h-72 items-center justify-center text-sm text-muted-foreground">No expenses linked to this tag.</p>}
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader><CardTitle>Recent linked expenses</CardTitle><CardDescription>Latest expenses assigned to this tag, across all dates.</CardDescription></CardHeader>
          <CardContent>
            {recentExpenses.length ? <div className="divide-y">
              {recentExpenses.map((item) => (
                <Link key={item.id} href="/expanses-log" className="flex items-center justify-between gap-4 py-3 transition-colors hover:text-primary">
                  <div className="min-w-0"><p className="truncate text-sm font-medium">{item.category}</p><p className="text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })} · {item.detail}</p></div>
                  <span className="shrink-0 text-sm font-medium tabular-nums">−{money.format(item.amount)}</span>
                </Link>
              ))}
            </div> : <p className="py-10 text-center text-sm text-muted-foreground">No expenses linked to this tag.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function DashboardView({ initialMonth }: { initialMonth: string }) {
  const [month, setMonth] = useState(initialMonth);
  const [tagId, setTagId] = useState("all");
  const { data: tags, isPending: tagsPending, isError: tagsError } = useGetDashboardTagsQuery(month);
  const { data, isPending, isError, error } = useGetDashboardQuery(month, tagId);

  useEffect(() => {
    if (tags && tagId !== "all" && !tags.some((tag) => tag.id === tagId)) {
      setTagId("all");
    }
  }, [tags, tagId]);

  const tagItems = [
    { value: "all", label: "All tags" },
    ...(tags ?? []).map((tag) => ({ value: tag.id, label: `${tag.name} · ${tag.source}` })),
  ];

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
        <div className="min-w-0"><h1 className="text-2xl font-semibold tracking-tight">{tagId === "all" ? "Financial overview" : "Income tag overview"}</h1><p className="mt-1 text-sm text-muted-foreground">{tagId === "all" ? "All records for the month, including expenses without a tag." : "The month chooses a tag; its allocation includes linked expenses from all dates."}</p></div>
        <FieldGroup className="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-[11rem_minmax(0,14rem)] xl:w-auto xl:items-end">
          <Field className="min-w-0 gap-1.5"><FieldLabel htmlFor="dashboard-month">Month</FieldLabel><Input id="dashboard-month" type="month" value={month} onChange={(event) => { if (event.target.value) { setTagId("all"); setMonth(event.target.value); } }} /></Field>
          <Field className="min-w-0 gap-1.5"><FieldLabel htmlFor="dashboard-tag">Income tag</FieldLabel>
            <Select items={tagItems} value={tagId} onValueChange={(value) => setTagId(value ?? "all")} disabled={tagsPending || tagsError}>
              <SelectTrigger id="dashboard-tag" className="min-w-0 w-full max-w-full"><SelectValue className="min-w-0 truncate" placeholder="All tags" /></SelectTrigger>
              <SelectContent><SelectGroup>{tagItems.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectGroup></SelectContent>
            </Select>
          </Field>
        </FieldGroup>
      </div>
      {tagsError && <p className="text-sm text-destructive">Could not load income tags for this month.</p>}
      {isPending ? <div className="flex min-h-80 items-center justify-center"><Spinner size="lg" /></div>
        : isError ? <Card><CardContent className="flex flex-col gap-2 py-10 text-center text-sm text-destructive"><p>{error.message}</p>{error.message.includes("PIN verification") && <Link href="/verify-pin" className="inline-block underline underline-offset-4">Unlock with PIN</Link>}</CardContent></Card>
        : data ? data.tagInsight ? <TagDashboardContent insight={data.tagInsight} /> : <DashboardContent data={data} /> : null}
    </div>
  );
}
