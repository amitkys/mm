"use client";

import { useState } from "react";
import { useGetExpansesCategoryQuery } from "@/app/expanses-category/query/get";
import { useGetIncomeQuery } from "@/app/income/query/get";
import { useCreateExpansesLogMutation } from "../query/create";
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
import { Plus, Loader2 } from "lucide-react";

export function AddExpansesLogSheet() {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const { data: categoryData } = useGetExpansesCategoryQuery();
  const { data: incomeData } = useGetIncomeQuery();

  const getTodayString = () => new Date().toISOString().split("T")[0];

  const [date, setDate] = useState<string>(getTodayString());
  const [incomeId, setIncomeId] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [subCategory, setSubCategory] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<
    "CASH" | "DEBIT CARD" | "CREDIT CARD" | "UPI" | "NET BANKING" | "OTHER"
  >("DEBIT CARD");
  const [source, setSource] = useState<
    | "Salary"
    | "Freelance/Business"
    | "Friend Repayment"
    | "Interest/Dividends"
    | "Refund"
    | "ATM Withdrawal"
    | "Other"
    | ""
  >("");
  const [type, setType] = useState<"NEED" | "WANT" | "INVESTMENT">("NEED");
  const [description, setDescription] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createMutation = useCreateExpansesLogMutation();

  const uniqueCategories = Array.from(
    new Set((categoryData ?? []).map((c) => c.category))
  ).sort();

  const uniqueSubCategories = category
    ? Array.from(
        new Set(
          (categoryData ?? [])
            .filter((c) => c.category === category && c.subCategory)
            .map((c) => c.subCategory!)
        )
      ).sort()
    : [];

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setDate(getTodayString());
      setIncomeId("");
      setCategory(uniqueCategories[0] || "");
      setSubCategory("");
      setAmount("");
      setPaymentMethod("DEBIT CARD");
      setSource("");
      setType("NEED");
      setDescription("");
      setErrorMessage(null);
    }
  };

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    setSubCategory("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!amount || isNaN(Number(amount))) {
      setErrorMessage("Please enter a valid amount.");
      return;
    }

    if (!category.trim()) {
      setErrorMessage("Please select a category.");
      return;
    }

    const matchedCat = (categoryData ?? []).find(
      (c) =>
        c.category === category.trim() &&
        (c.subCategory || null) === (subCategory.trim() || null)
    );

    const selectedIncome = (incomeData ?? []).find((inc) => inc.id === incomeId);

    const res = await createMutation.mutateAsync({
      date: new Date(date),
      incomeId: selectedIncome?.id || null,
      name: selectedIncome?.name || null,
      categoryId: matchedCat?.id || null,
      category: category.trim(),
      subCategory: subCategory.trim() ? subCategory.trim() : null,
      amount,
      paymentMethod,
      source: source ? source : selectedIncome?.source || null,
      type,
      description: description.trim() ? description.trim() : null,
    });

    if (res.success) {
      setIsOpen(false);
    } else {
      setErrorMessage(res.message || "Failed to log expense.");
    }
  };

  return (
    <>
      <Button onClick={() => handleOpenChange(true)} size="sm">
        <Plus className="h-4 w-4 mr-1.5" />
        Add Expense
      </Button>

      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetContent side={isMobile ? "bottom" : "right"} className="p-6 data-[side=right]:sm:max-w-2xl lg:data-[side=right]:max-w-3xl">
          <SheetHeader className="mb-6 p-0">
            <SheetTitle>Log Expense</SheetTitle>
            <SheetDescription>
              Record a new spending transaction into your expense log.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="exp-date">Date</Label>
              <Input
                id="exp-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="exp-income">Funded From Income (Tag)</Label>
              <select
                id="exp-income"
                value={incomeId}
                onChange={(e) => setIncomeId(e.target.value)}
                className="h-9 w-full min-w-0 rounded-3xl border border-transparent bg-input/50 px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
              >
                <option value="">None (Unassigned)</option>
                {(incomeData ?? []).map((inc) => (
                  <option key={inc.id} value={inc.id}>
                    {inc.name} ({inc.source} - ₹{inc.amount})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="exp-category">Category</Label>
              <select
                id="exp-category"
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="h-9 w-full min-w-0 rounded-3xl border border-transparent bg-input/50 px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
                required
              >
                <option value="">Select Category...</option>
                {uniqueCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {uniqueSubCategories.length > 0 && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="exp-subcategory">Sub Category (Optional)</Label>
                <select
                  id="exp-subcategory"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  className="h-9 w-full min-w-0 rounded-3xl border border-transparent bg-input/50 px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
                >
                  <option value="">None</option>
                  {uniqueSubCategories.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="exp-amount">Amount</Label>
              <Input
                id="exp-amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 45.00"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="exp-paymentMethod">Payment Method</Label>
              <select
                id="exp-paymentMethod"
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(e.target.value as typeof paymentMethod)
                }
                className="h-9 w-full min-w-0 rounded-3xl border border-transparent bg-input/50 px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
              >
                <option value="DEBIT CARD">DEBIT CARD</option>
                <option value="CREDIT CARD">CREDIT CARD</option>
                <option value="UPI">UPI</option>
                <option value="CASH">CASH</option>
                <option value="NET BANKING">NET BANKING</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="exp-source">Source (Optional)</Label>
              <select
                id="exp-source"
                value={source}
                onChange={(e) => setSource(e.target.value as typeof source)}
                className="h-9 w-full min-w-0 rounded-3xl border border-transparent bg-input/50 px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
              >
                <option value="">None</option>
                <option value="Salary">Salary</option>
                <option value="Freelance/Business">Freelance/Business</option>
                <option value="Friend Repayment">Friend Repayment</option>
                <option value="Interest/Dividends">Interest/Dividends</option>
                <option value="Refund">Refund</option>
                <option value="ATM Withdrawal">ATM Withdrawal</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="exp-type">Spending Type</Label>
              <select
                id="exp-type"
                value={type}
                onChange={(e) => setType(e.target.value as typeof type)}
                className="h-9 w-full min-w-0 rounded-3xl border border-transparent bg-input/50 px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
              >
                <option value="NEED">NEED</option>
                <option value="WANT">WANT</option>
                <option value="INVESTMENT">INVESTMENT</option>
              </select>
            </div>

            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="exp-description">Description (Optional)</Label>
              <Input
                id="exp-description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Weekly grocery trip"
              />
            </div>

            {errorMessage && (
              <div className="rounded-md bg-destructive/10 p-3 text-xs text-destructive sm:col-span-2">
                {errorMessage}
              </div>
            )}

            <SheetFooter className="mt-6 flex-row justify-end gap-2 p-0 sm:col-span-2">
              <SheetClose render={<Button type="button" variant="outline" />}>
                Cancel
              </SheetClose>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Expense
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
