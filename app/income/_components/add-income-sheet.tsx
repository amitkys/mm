"use client";

import { useState } from "react";
import { useCreateIncomeMutation } from "../query/create";
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

export function AddIncomeSheet() {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const getTodayString = () => new Date().toISOString().split("T")[0];

  const [date, setDate] = useState<string>(getTodayString());
  const [type, setType] = useState<"Income" | "Transfer" | "Reimbursement">("Income");
  const [source, setSource] = useState<
    | "Salary"
    | "Freelance/Business"
    | "Friend Repayment"
    | "Interest/Dividends"
    | "Refund"
    | "ATM Withdrawal"
    | "Other"
  >("Salary");
  const [amount, setAmount] = useState<string>("");
  const [depositedTo, setDepositedTo] = useState<
    "Cash" | "Bank" | "UPI" | "Credit Card" | "Other"
  >("Bank");
  const [description, setDescription] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createMutation = useCreateIncomeMutation();

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setDate(getTodayString());
      setType("Income");
      setSource("Salary");
      setAmount("");
      setDepositedTo("Bank");
      setDescription("");
      setNotes("");
      setErrorMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!amount || isNaN(Number(amount))) {
      setErrorMessage("Please enter a valid amount.");
      return;
    }

    const res = await createMutation.mutateAsync({
      date: new Date(date),
      type,
      source,
      amount,
      depositedTo,
      description: description.trim() ? description.trim() : null,
      notes: notes.trim() ? notes.trim() : null,
    });

    if (res.success) {
      setIsOpen(false);
    } else {
      setErrorMessage(res.message || "Failed to create income record.");
    }
  };

  return (
    <>
      <Button onClick={() => handleOpenChange(true)} size="sm">
        <Plus className="h-4 w-4 mr-1.5" />
        Add Income
      </Button>

      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetContent side={isMobile ? "bottom" : "right"} className="p-6 sm:max-w-md">
          <SheetHeader className="mb-6 p-0">
            <SheetTitle>Add Income Record</SheetTitle>
            <SheetDescription>
              Log incoming money or transfers into your accounts.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="income-date">Date</Label>
              <Input
                id="income-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="income-type">Type</Label>
              <select
                id="income-type"
                value={type}
                onChange={(e) => setType(e.target.value as typeof type)}
                className="h-9 w-full min-w-0 rounded-3xl border border-transparent bg-input/50 px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
              >
                <option value="Income">Income (Counts towards savings)</option>
                <option value="Transfer">Transfer (e.g. ATM withdrawal)</option>
                <option value="Reimbursement">Reimbursement</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="income-source">Source</Label>
              <select
                id="income-source"
                value={source}
                onChange={(e) => setSource(e.target.value as typeof source)}
                className="h-9 w-full min-w-0 rounded-3xl border border-transparent bg-input/50 px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
              >
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
              <Label htmlFor="income-amount">Amount</Label>
              <Input
                id="income-amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 10000"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="income-depositedTo">Deposited To</Label>
              <select
                id="income-depositedTo"
                value={depositedTo}
                onChange={(e) => setDepositedTo(e.target.value as typeof depositedTo)}
                className="h-9 w-full min-w-0 rounded-3xl border border-transparent bg-input/50 px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
              >
                <option value="Bank">Bank</option>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="income-description">Description (Optional)</Label>
              <Input
                id="income-description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Monthly Salary"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="income-notes">Notes (Optional)</Label>
              <Input
                id="income-notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes..."
              />
            </div>

            {errorMessage && (
              <div className="rounded-md bg-destructive/10 p-3 text-xs text-destructive">
                {errorMessage}
              </div>
            )}

            <SheetFooter className="mt-6 flex-row justify-end gap-2 p-0">
              <SheetClose render={<Button type="button" variant="outline" />}>
                Cancel
              </SheetClose>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Add Record
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
