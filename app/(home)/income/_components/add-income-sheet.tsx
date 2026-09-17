"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreateIncomeMutation } from "../query/create";
import {
  createIncomeSchema,
  type CreateIncomeSchema,
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
import { Plus } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export function AddIncomeSheet() {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const getTodayString = () => new Date().toISOString().split("T")[0];

  const createMutation = useCreateIncomeMutation();

  const form = useForm<CreateIncomeSchema>({
    resolver: zodResolver(createIncomeSchema),
    defaultValues: {
      date: new Date(),
      type: "Income",
      source: "Salary",
      amount: "",
      depositedTo: "Bank",
      description: "",
      notes: "",
    },
  });

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      form.reset({
        date: new Date(),
        type: "Income",
        source: "Salary",
        amount: "",
        depositedTo: "Bank",
        description: "",
        notes: "",
      });
      setServerError(null);
    }
  };

  const onSubmit = async (values: CreateIncomeSchema) => {
    setServerError(null);

    const res = await createMutation.mutateAsync({
      ...values,
      description: values.description?.trim() ? values.description.trim() : null,
      notes: values.notes?.trim() ? values.notes.trim() : null,
    });

    if (res.success) {
      setIsOpen(false);
    } else {
      setServerError(res.message || "Failed to create income record.");
    }
  };

  return (
    <>
      <Button onClick={() => handleOpenChange(true)} size="sm">
        <Plus className="h-4 w-4 mr-1.5" />
        Add Income
      </Button>

      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetContent
          side={isMobile ? "bottom" : "right"}
          className="p-6 data-[side=right]:sm:max-w-2xl lg:data-[side=right]:max-w-3xl"
        >
          <SheetHeader className="mb-6 p-0">
            <SheetTitle>Add Income Record</SheetTitle>
            <SheetDescription>
              Log incoming money or transfers into your accounts.
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {/* Date */}
            <Controller
              control={form.control}
              name="date"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel requiredLable htmlFor="income-date">
                    Date
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id="income-date"
                      type="date"
                      value={
                        field.value instanceof Date && !isNaN(field.value.getTime())
                          ? field.value.toISOString().split("T")[0]
                          : getTodayString()
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
                  <FieldLabel requiredLable htmlFor="income-type">
                    Type
                  </FieldLabel>
                  <FieldContent>
                    <select
                      {...field}
                      id="income-type"
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
                  <FieldLabel requiredLable htmlFor="income-source">
                    Source
                  </FieldLabel>
                  <FieldContent>
                    <select
                      {...field}
                      id="income-source"
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
                  <FieldLabel requiredLable htmlFor="income-amount">
                    Amount
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      id="income-amount"
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
                  <FieldLabel requiredLable htmlFor="income-depositedTo">
                    Deposited To
                  </FieldLabel>
                  <FieldContent>
                    <select
                      {...field}
                      id="income-depositedTo"
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
                  <FieldLabel htmlFor="income-description">
                    Description (Optional)
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      id="income-description"
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
                  <FieldLabel htmlFor="income-notes">
                    Notes (Optional)
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      id="income-notes"
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
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && (
                  <Spinner size="sm" className="mr-2" />
                )}
                Save Income
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
