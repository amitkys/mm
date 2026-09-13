"use client";

import { useState } from "react";
import { type Income } from "../query/get";
import { useUpdateIncomeMutation } from "../query/update";
import { useDeleteIncomeMutation } from "../query/delete";
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
import { Edit, Trash2, Loader2 } from "lucide-react";

interface IncomeRowActionsProps {
  incomeItem: Income;
}

export function IncomeRowActions({ incomeItem }: IncomeRowActionsProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const formatDateForInput = (d: Date | string) => {
    const dateObj = new Date(d);
    return dateObj.toISOString().split("T")[0];
  };

  const [date, setDate] = useState<string>(formatDateForInput(incomeItem.date));
  const [type, setType] = useState<Income["type"]>(incomeItem.type);
  const [source, setSource] = useState<Income["source"]>(incomeItem.source);
  const [amount, setAmount] = useState<string>(incomeItem.amount);
  const [depositedTo, setDepositedTo] = useState<Income["depositedTo"]>(
    incomeItem.depositedTo
  );
  const [description, setDescription] = useState<string>(
    incomeItem.description ?? ""
  );
  const [notes, setNotes] = useState<string>(incomeItem.notes ?? "");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateMutation = useUpdateIncomeMutation();
  const deleteMutation = useDeleteIncomeMutation();

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setDate(formatDateForInput(incomeItem.date));
      setType(incomeItem.type);
      setSource(incomeItem.source);
      setAmount(incomeItem.amount);
      setDepositedTo(incomeItem.depositedTo);
      setDescription(incomeItem.description ?? "");
      setNotes(incomeItem.notes ?? "");
      setErrorMessage(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!amount || isNaN(Number(amount))) {
      setErrorMessage("Please enter a valid amount.");
      return;
    }

    const res = await updateMutation.mutateAsync({
      id: incomeItem.id,
      input: {
        date: new Date(date),
        type,
        source,
        amount,
        depositedTo,
        description: description.trim() ? description.trim() : null,
        notes: notes.trim() ? notes.trim() : null,
      },
    });

    if (res.success) {
      setIsOpen(false);
    } else {
      setErrorMessage(res.message || "Failed to update income record.");
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete income entry "${incomeItem.name}" (${incomeItem.source} - $${incomeItem.amount})?`
      )
    ) {
      return;
    }

    setErrorMessage(null);
    const res = await deleteMutation.mutateAsync(incomeItem.id);
    if (!res.success) {
      alert(res.message || "Failed to delete income record.");
    }
  };

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          size="icon-xs"
          variant="ghost"
          onClick={() => handleOpenChange(true)}
          title="Edit Income Record"
        >
          <Edit className="h-3.5 w-3.5" />
        </Button>

        <Button
          size="icon-xs"
          variant="ghost"
          className="text-destructive hover:bg-destructive/10"
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
          title="Delete Income Record"
        >
          {deleteMutation.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>

      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetContent side={isMobile ? "bottom" : "right"} className="p-6 sm:max-w-md">
          <SheetHeader className="mb-6 p-0">
            <SheetTitle>Edit Income Record</SheetTitle>
            <SheetDescription>
              Update transaction details for identifier: {incomeItem.name}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-date">Date</Label>
              <Input
                id="edit-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-type">Type</Label>
              <select
                id="edit-type"
                value={type}
                onChange={(e) => setType(e.target.value as Income["type"])}
                className="h-9 w-full min-w-0 rounded-3xl border border-transparent bg-input/50 px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
              >
                <option value="Income">Income (Counts towards savings)</option>
                <option value="Transfer">Transfer (e.g. ATM withdrawal)</option>
                <option value="Reimbursement">Reimbursement</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-source">Source</Label>
              <select
                id="edit-source"
                value={source}
                onChange={(e) => setSource(e.target.value as Income["source"])}
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
              <Label htmlFor="edit-amount">Amount</Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-depositedTo">Deposited To</Label>
              <select
                id="edit-depositedTo"
                value={depositedTo}
                onChange={(e) => setDepositedTo(e.target.value as Income["depositedTo"])}
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
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <Input
                id="edit-description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. August Salary Payment"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-notes">Notes (Optional)</Label>
              <Input
                id="edit-notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional details..."
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
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
