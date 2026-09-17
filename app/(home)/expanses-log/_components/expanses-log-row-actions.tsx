"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { type ExpansesLog } from "../query/get";
import { useGetExpansesCategoryQuery } from "@/app/(home)/expanses-category/query/get";
import { useGetIncomeQuery } from "@/app/(home)/income/query/get";
import { useUpdateExpansesLogMutation } from "../query/update";
import { useDeleteExpansesLogMutation } from "../query/delete";
import {
  updateExpansesLogSchema,
  type UpdateExpansesLogSchema,
} from "../lib/zod-type/expanses-log";

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

interface ExpansesLogRowActionsProps {
  logItem: ExpansesLog;
}

export function ExpansesLogRowActions({ logItem }: ExpansesLogRowActionsProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { data: categoryData } = useGetExpansesCategoryQuery();
  const { data: incomeData } = useGetIncomeQuery();

  const formatDateForInput = (d: Date | string) => {
    const dateObj = new Date(d);
    return dateObj.toISOString().split("T")[0];
  };

  const updateMutation = useUpdateExpansesLogMutation();
  const deleteMutation = useDeleteExpansesLogMutation();

  const uniqueCategories = Array.from(
    new Set((categoryData ?? []).map((c) => c.category))
  ).sort();

  const form = useForm<UpdateExpansesLogSchema>({
    resolver: zodResolver(updateExpansesLogSchema),
    defaultValues: {
      date: new Date(logItem.date),
      incomeId: logItem.incomeId ?? "",
      category: logItem.category,
      subCategory: logItem.subCategory ?? "",
      amount: logItem.amount,
      paymentMethod: logItem.paymentMethod,
      source: logItem.source ?? undefined,
      type: logItem.type,
      description: logItem.description ?? "",
    },
  });

  const categoryWatch = form.watch("category");

  const uniqueSubCategories = categoryWatch
    ? Array.from(
        new Set(
          (categoryData ?? [])
            .filter((c) => c.category === categoryWatch && c.subCategory)
            .map((c) => c.subCategory!)
        )
      ).sort()
    : [];

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      form.reset({
        date: new Date(logItem.date),
        incomeId: logItem.incomeId ?? "",
        category: logItem.category,
        subCategory: logItem.subCategory ?? "",
        amount: logItem.amount,
        paymentMethod: logItem.paymentMethod,
        source: logItem.source ?? undefined,
        type: logItem.type,
        description: logItem.description ?? "",
      });
      setServerError(null);
    }
  };

  const handleSave = async (values: UpdateExpansesLogSchema) => {
    setServerError(null);

    const matchedCat = (categoryData ?? []).find(
      (c) =>
        c.category === values.category?.trim() &&
        (c.subCategory || null) === (values.subCategory?.trim() || null)
    );

    const selectedIncome = (incomeData ?? []).find(
      (inc) => inc.id === values.incomeId
    );

    const res = await updateMutation.mutateAsync({
      id: logItem.id,
      input: {
        ...values,
        incomeId: selectedIncome?.id || null,
        name: selectedIncome?.name || logItem.name || null,
        categoryId: matchedCat?.id || null,
        category: values.category?.trim(),
        subCategory: values.subCategory?.trim() ? values.subCategory.trim() : null,
        description: values.description?.trim() ? values.description.trim() : null,
      },
    });

    if (res.success) {
      setIsOpen(false);
    } else {
      setServerError(res.message || "Failed to update expense log.");
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

    setServerError(null);
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
        <SheetContent
          side={isMobile ? "bottom" : "right"}
          className="p-6 data-[side=right]:sm:max-w-2xl lg:data-[side=right]:max-w-3xl"
        >
          <SheetHeader className="mb-6 p-0">
            <SheetTitle>Edit Expense Log</SheetTitle>
            <SheetDescription>
              Update expense details for tag: {logItem.name || "Unassigned"}
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
                  <FieldLabel requiredLable htmlFor="edit-exp-date">
                    Date
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id="edit-exp-date"
                      type="date"
                      value={
                        field.value instanceof Date && !isNaN(field.value.getTime())
                          ? formatDateForInput(field.value)
                          : formatDateForInput(logItem.date)
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

            {/* Income Tagging */}
            <Controller
              control={form.control}
              name="incomeId"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor="edit-exp-income">
                    Funded From Income (Tag)
                  </FieldLabel>
                  <FieldContent>
                    <select
                      {...field}
                      id="edit-exp-income"
                      value={field.value ?? ""}
                      aria-invalid={fieldState.invalid}
                      className="h-9 w-full min-w-0 rounded-3xl border border-transparent bg-input/50 px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
                    >
                      <option value="">None (Unassigned)</option>
                      {(incomeData ?? []).map((inc) => (
                        <option key={inc.id} value={inc.id}>
                          {inc.name} ({inc.source} - ₹{inc.amount})
                        </option>
                      ))}
                    </select>
                    <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
                  </FieldContent>
                </Field>
              )}
            />

            {/* Category */}
            <Controller
              control={form.control}
              name="category"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel requiredLable htmlFor="edit-exp-category">
                    Category
                  </FieldLabel>
                  <FieldContent>
                    <select
                      {...field}
                      id="edit-exp-category"
                      aria-invalid={fieldState.invalid}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        form.setValue("subCategory", "");
                      }}
                      className="h-9 w-full min-w-0 rounded-3xl border border-transparent bg-input/50 px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
                    >
                      <option value="">Select Category...</option>
                      {uniqueCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
                  </FieldContent>
                </Field>
              )}
            />

            {/* Sub Category */}
            {uniqueSubCategories.length > 0 && (
              <Controller
                control={form.control}
                name="subCategory"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid || undefined}>
                    <FieldLabel htmlFor="edit-exp-subcategory">
                      Sub Category (Optional)
                    </FieldLabel>
                    <FieldContent>
                      <select
                        {...field}
                        id="edit-exp-subcategory"
                        value={field.value ?? ""}
                        aria-invalid={fieldState.invalid}
                        className="h-9 w-full min-w-0 rounded-3xl border border-transparent bg-input/50 px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
                      >
                        <option value="">None</option>
                        {uniqueSubCategories.map((sub) => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))}
                      </select>
                      <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
                    </FieldContent>
                  </Field>
                )}
              />
            )}

            {/* Amount */}
            <Controller
              control={form.control}
              name="amount"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel requiredLable htmlFor="edit-exp-amount">
                    Amount
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      id="edit-exp-amount"
                      type="number"
                      step="0.01"
                      aria-invalid={fieldState.invalid}
                      placeholder="e.g. 45.00"
                    />
                    <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
                  </FieldContent>
                </Field>
              )}
            />

            {/* Payment Method */}
            <Controller
              control={form.control}
              name="paymentMethod"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel requiredLable htmlFor="edit-exp-paymentMethod">
                    Payment Method
                  </FieldLabel>
                  <FieldContent>
                    <select
                      {...field}
                      id="edit-exp-paymentMethod"
                      aria-invalid={fieldState.invalid}
                      className="h-9 w-full min-w-0 rounded-3xl border border-transparent bg-input/50 px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
                    >
                      <option value="DEBIT CARD">DEBIT CARD</option>
                      <option value="CREDIT CARD">CREDIT CARD</option>
                      <option value="UPI">UPI</option>
                      <option value="CASH">CASH</option>
                      <option value="NET BANKING">NET BANKING</option>
                      <option value="OTHER">OTHER</option>
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
                  <FieldLabel htmlFor="edit-exp-source">
                    Source (Optional)
                  </FieldLabel>
                  <FieldContent>
                    <select
                      {...field}
                      id="edit-exp-source"
                      value={field.value ?? ""}
                      aria-invalid={fieldState.invalid}
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
                    <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
                  </FieldContent>
                </Field>
              )}
            />

            {/* Spending Type */}
            <Controller
              control={form.control}
              name="type"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel requiredLable htmlFor="edit-exp-type">
                    Spending Type
                  </FieldLabel>
                  <FieldContent>
                    <select
                      {...field}
                      id="edit-exp-type"
                      aria-invalid={fieldState.invalid}
                      className="h-9 w-full min-w-0 rounded-3xl border border-transparent bg-input/50 px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
                    >
                      <option value="NEED">NEED</option>
                      <option value="WANT">WANT</option>
                      <option value="INVESTMENT">INVESTMENT</option>
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
                <Field data-invalid={fieldState.invalid || undefined} className="sm:col-span-2">
                  <FieldLabel htmlFor="edit-exp-description">
                    Description (Optional)
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      id="edit-exp-description"
                      type="text"
                      value={field.value ?? ""}
                      aria-invalid={fieldState.invalid}
                      placeholder="e.g. Weekly grocery trip"
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
