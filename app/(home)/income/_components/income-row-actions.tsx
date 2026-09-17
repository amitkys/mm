"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { type Income } from "../query/get";
import { useUpdateIncomeMutation } from "../query/update";
import { useDeleteIncomeMutation } from "../query/delete";
import {
  updateIncomeSchema,
  type UpdateIncomeSchema,
} from "../lib/zod-type/income";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
} from "@/components/ui/field";
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

interface IncomeRowActionsProps {
  incomeItem: Income;
}

export function IncomeRowActions({ incomeItem }: IncomeRowActionsProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const formatDateForInput = (d: Date | string) => {
    const dateObj = new Date(d);
    return dateObj.toISOString().split("T")[0];
  };

  const updateMutation = useUpdateIncomeMutation();
  const deleteMutation = useDeleteIncomeMutation();

  const form = useForm<UpdateIncomeSchema>({
    resolver: zodResolver(updateIncomeSchema),
    defaultValues: {
      date: new Date(incomeItem.date),
      type: incomeItem.type,
      source: incomeItem.source,
      amount: incomeItem.amount,
      depositedTo: incomeItem.depositedTo,
      description: incomeItem.description ?? "",
      notes: incomeItem.notes ?? "",
    },
  });

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      form.reset({
        date: new Date(incomeItem.date),
        type: incomeItem.type,
        source: incomeItem.source,
        amount: incomeItem.amount,
        depositedTo: incomeItem.depositedTo,
        description: incomeItem.description ?? "",
        notes: incomeItem.notes ?? "",
      });
      setServerError(null);
    }
  };

  const handleSave = async (values: UpdateIncomeSchema) => {
    setServerError(null);

    const res = await updateMutation.mutateAsync({
      id: incomeItem.id,
      input: {
        ...values,
        description: values.description?.trim() ? values.description.trim() : null,
        notes: values.notes?.trim() ? values.notes.trim() : null,
      },
    });

    if (res.success) {
      setIsOpen(false);
    } else {
      setServerError(res.message || "Failed to update income record.");
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete income entry "${incomeItem.name}" (${incomeItem.source} - ₹${incomeItem.amount})?`
      )
    ) {
      return;
    }

    setServerError(null);
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
            <Spinner size="xs" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>

      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetContent
          side={isMobile ? "bottom" : "right"}
          className="p-6 data-[side=right]:sm:max-w-2xl lg:data-[side=right]:max-w-3xl"
        >
          <SheetHeader className="mb-6 p-0">
            <SheetTitle>Edit Income Record</SheetTitle>
            <SheetDescription>
              Update transaction details for identifier: {incomeItem.name}
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={form.handleSubmit(handleSave)}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {/* Date */}
            <Controller
              control={form.control}
              name="date"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel requiredLable htmlFor="edit-date">
                    Date
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id="edit-date"
                      type="date"
                      value={
                        field.value instanceof Date && !isNaN(field.value.getTime())
                          ? formatDateForInput(field.value)
                          : formatDateForInput(incomeItem.date)
                      }
                      onChange={(e) =>
                        field.onChange(new Date(e.target.value))
                      }
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
                  </FieldContent>
                </Field>
              )}
            />

            {/* Type */}
            <Controller
              control={form.control}
              name="type"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel requiredLable htmlFor="edit-type">
                    Type
                  </FieldLabel>
                  <FieldContent>
                    <select
                      {...field}
                      id="edit-type"
                      aria-invalid={fieldState.invalid}
                      className="h-9 w-full min-w-0 rounded-3xl border border-transparent bg-input/50 px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
                    >
                      <option value="Income">Income (Counts towards savings)</option>
                      <option value="Transfer">Transfer (e.g. ATM withdrawal)</option>
                      <option value="Reimbursement">Reimbursement</option>
                    </select>
                    <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
                  </FieldContent>
                </Field>
              )}
            />

            {/* Source */}
            <Controller
              control={form.control}
              name="source"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel requiredLable htmlFor="edit-source">
                    Source
                  </FieldLabel>
                  <FieldContent>
                    <select
                      {...field}
                      id="edit-source"
                      aria-invalid={fieldState.invalid}
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
                    <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
                  </FieldContent>
                </Field>
              )}
            />

            {/* Amount */}
            <Controller
              control={form.control}
              name="amount"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel requiredLable htmlFor="edit-amount">
                    Amount
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      id="edit-amount"
                      type="number"
                      step="0.01"
                      aria-invalid={fieldState.invalid}
                      placeholder="e.g. 10000"
                    />
                    <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
                  </FieldContent>
                </Field>
              )}
            />

            {/* Deposited To */}
            <Controller
              control={form.control}
              name="depositedTo"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel requiredLable htmlFor="edit-depositedTo">
                    Deposited To
                  </FieldLabel>
                  <FieldContent>
                    <select
                      {...field}
                      id="edit-depositedTo"
                      aria-invalid={fieldState.invalid}
                      className="h-9 w-full min-w-0 rounded-3xl border border-transparent bg-input/50 px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
                    >
                      <option value="Bank">Bank</option>
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Other">Other</option>
                    </select>
                    <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
                  </FieldContent>
                </Field>
              )}
            />

            {/* Description */}
            <Controller
              control={form.control}
              name="description"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor="edit-description">
                    Description (Optional)
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      id="edit-description"
                      type="text"
                      value={field.value ?? ""}
                      aria-invalid={fieldState.invalid}
                      placeholder="e.g. Monthly Salary"
                    />
                    <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
                  </FieldContent>
                </Field>
              )}
            />

            {/* Notes */}
            <Controller
              control={form.control}
              name="notes"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined} className="sm:col-span-2">
                  <FieldLabel htmlFor="edit-notes">
                    Notes (Optional)
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      id="edit-notes"
                      type="text"
                      value={field.value ?? ""}
                      aria-invalid={fieldState.invalid}
                      placeholder="Additional notes..."
                    />
                    <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
                  </FieldContent>
                </Field>
              )}
            />

            {serverError && (
              <div className="rounded-md bg-destructive/10 p-3 text-xs text-destructive sm:col-span-2">
                {serverError}
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
