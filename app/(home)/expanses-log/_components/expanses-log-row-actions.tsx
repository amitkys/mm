"use client";

import { useState } from "react";
import { type ExpansesLog } from "../query/get";
import { useGetExpansesCategoryQuery } from "@/app/(home)/expanses-category/query/get";
import { useGetIncomeQuery } from "@/app/(home)/income/query/get";
import { useUpdateExpansesLogMutation } from "../query/update";
import { useDeleteExpansesLogMutation } from "../query/delete";
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
import { Edit, Trash2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface ExpansesLogRowActionsProps {
  logItem: ExpansesLog;
}

export function ExpansesLogRowActions({ logItem }: ExpansesLogRowActionsProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const { data: categoryData } = useGetExpansesCategoryQuery();
  const { data: incomeData } = useGetIncomeQuery();

  const formatDateForInput = (d: Date | string) => {
    const dateObj = new Date(d);
    return dateObj.toISOString().split("T")[0];
  };

  const [date, setDate] = useState<string>(formatDateForInput(logItem.date));
  const [incomeId, setIncomeId] = useState<string>(logItem.incomeId ?? "");
  const [category, setCategory] = useState<string>(logItem.category);
  const [subCategory, setSubCategory] = useState<string>(
    logItem.subCategory ?? ""
  );
  const [amount, setAmount] = useState<string>(logItem.amount);
  const [paymentMethod, setPaymentMethod] = useState<ExpansesLog["paymentMethod"]>(
    logItem.paymentMethod
  );
  const [source, setSource] = useState<ExpansesLog["source"]>(logItem.source);
  const [type, setType] = useState<ExpansesLog["type"]>(logItem.type);
  const [description, setDescription] = useState<string>(
    logItem.description ?? ""
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateMutation = useUpdateExpansesLogMutation();
  const deleteMutation = useDeleteExpansesLogMutation();

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
      setDate(formatDateForInput(logItem.date));
      setIncomeId(logItem.incomeId ?? "");
      setCategory(logItem.category);
      setSubCategory(logItem.subCategory ?? "");
      setAmount(logItem.amount);
      setPaymentMethod(logItem.paymentMethod);
      setSource(logItem.source);
      setType(logItem.type);
      setDescription(logItem.description ?? "");
      setErrorMessage(null);
    }
  };

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    setSubCategory("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!amount || isNaN(Number(amount))) {
      setErrorMessage("Please enter a valid amount.");
      return;
    }

    if (!category.trim()) {
      setErrorMessage("Please select or enter a category.");
      return;
    }

    const matchedCat = (categoryData ?? []).find(
      (c) =>
        c.category === category.trim() &&
        (c.subCategory || null) === (subCategory.trim() || null)
    );

    const selectedIncome = (incomeData ?? []).find((inc) => inc.id === incomeId);

    const res = await updateMutation.mutateAsync({
      id: logItem.id,
      input: {
        date: new Date(date),
        incomeId: selectedIncome?.id || null,
        name: selectedIncome?.name || logItem.name || null,
        categoryId: matchedCat?.id || null,
        category: category.trim(),
        subCategory: subCategory.trim() ? subCategory.trim() : null,
        amount,
        paymentMethod,
        source,
        type,
        description: description.trim() ? description.trim() : null,
      },
    });

    if (res.success) {
      setIsOpen(false);
    } else {
      setErrorMessage(res.message || "Failed to update expense log.");
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete expense entry "${logItem.name || logItem.category}" (${logItem.category} - ₹${logItem.amount})?`
      )
    ) {
      return;
    }

    setErrorMessage(null);
    const res = await deleteMutation.mutateAsync(logItem.id);
    if (!res.success) {
      alert(res.message || "Failed to delete expense log.");
    }
  };

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          size="icon-xs"
          variant="ghost"
          onClick={() => handleOpenChange(true)}
          title="Edit Expense Log"
        >
          <Edit className="h-3.5 w-3.5" />
        </Button>

        <Button
          size="icon-xs"
          variant="ghost"
          className="text-destructive hover:bg-destructive/10"
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
          title="Delete Expense Log"
        >
          {deleteMutation.isPending ? (
            <Spinner size="xs" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>

      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetContent side={isMobile ? "bottom" : "right"} className="p-6 data-[side=right]:sm:max-w-2xl lg:data-[side=right]:max-w-3xl">
          <SheetHeader className="mb-6 p-0">
            <SheetTitle>Edit Expense Log</SheetTitle>
            <SheetDescription>
              Update expense details for tag: {logItem.name || "Unassigned"}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-exp-date">Date</Label>
              <Input
                id="edit-exp-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-exp-income">Funded From Income (Tag)</Label>
              <select
                id="edit-exp-income"
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
              <Label htmlFor="edit-exp-category">Category</Label>
              <select
                id="edit-exp-category"
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
                <Label htmlFor="edit-exp-subcategory">Sub Category (Optional)</Label>
                <select
                  id="edit-exp-subcategory"
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
              <Label htmlFor="edit-exp-amount">Amount</Label>
              <Input
                id="edit-exp-amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-exp-paymentMethod">Payment Method</Label>
              <select
                id="edit-exp-paymentMethod"
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(e.target.value as ExpansesLog["paymentMethod"])
                }
                className="h-9 w-full min-w-0 rounded-3xl border border-transparent bg-input/50 px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
              >
                <option value="CASH">CASH</option>
                <option value="DEBIT CARD">DEBIT CARD</option>
                <option value="CREDIT CARD">CREDIT CARD</option>
                <option value="UPI">UPI</option>
                <option value="NET BANKING">NET BANKING</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-exp-source">Source (Optional)</Label>
              <select
                id="edit-exp-source"
                value={source ?? ""}
                onChange={(e) =>
                  setSource(
                    e.target.value
                      ? (e.target.value as ExpansesLog["source"])
                      : null
                  )
                }
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
              <Label htmlFor="edit-exp-type">Spending Type</Label>
              <select
                id="edit-exp-type"
                value={type}
                onChange={(e) => setType(e.target.value as ExpansesLog["type"])}
                className="h-9 w-full min-w-0 rounded-3xl border border-transparent bg-input/50 px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
              >
                <option value="NEED">NEED</option>
                <option value="WANT">WANT</option>
                <option value="INVESTMENT">INVESTMENT</option>
              </select>
            </div>

            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="edit-exp-description">Description (Optional)</Label>
              <Input
                id="edit-exp-description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Grocery shopping at Walmart"
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
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && (
                  <Spinner size="sm" className="mr-2" />
                )}
                Save Changes
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
