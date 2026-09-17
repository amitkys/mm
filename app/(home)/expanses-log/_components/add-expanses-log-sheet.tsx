"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useGetExpansesCategoryQuery } from "@/app/(home)/expanses-category/query/get";
import { useGetIncomeQuery } from "@/app/(home)/income/query/get";
import { useCreateExpansesLogMutation } from "../query/create";
import {
  createExpansesLogSchema,
  type CreateExpansesLogSchema,
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
import { Plus } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export function AddExpansesLogSheet() {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { data: categoryData } = useGetExpansesCategoryQuery();
  const { data: incomeData } = useGetIncomeQuery();

  const getTodayString = () => new Date().toISOString().split("T")[0];

  const createMutation = useCreateExpansesLogMutation();

  const uniqueCategories = Array.from(
    new Set((categoryData ?? []).map((c) => c.category))
  ).sort();

  const form = useForm<CreateExpansesLogSchema>({
    resolver: zodResolver(createExpansesLogSchema),
    defaultValues: {
      date: new Date(),
      incomeId: "",
      category: "",
      subCategory: "",
      amount: "",
      paymentMethod: "DEBIT CARD",
      source: undefined,
      type: "NEED",
      description: "",
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
        date: new Date(),
        incomeId: "",
        category: uniqueCategories[0] || "",
        subCategory: "",
        amount: "",
        paymentMethod: "DEBIT CARD",
        source: undefined,
        type: "NEED",
        description: "",
      });
      setServerError(null);
    }
  };

  const onSubmit = async (values: CreateExpansesLogSchema) => {
    setServerError(null);

    const matchedCat = (categoryData ?? []).find(
      (c) =>
        c.category === values.category.trim() &&
        (c.subCategory || null) === (values.subCategory?.trim() || null)
    );

    const selectedIncome = (incomeData ?? []).find(
      (inc) => inc.id === values.incomeId
    );

    const res = await createMutation.mutateAsync({
      ...values,
      incomeId: selectedIncome?.id || null,
      name: selectedIncome?.name || null,
      categoryId: matchedCat?.id || null,
      subCategory: values.subCategory?.trim() ? values.subCategory.trim() : null,
      source: values.source || (selectedIncome?.source as any) || null,
      description: values.description?.trim() ? values.description.trim() : null,
    });

    if (res.success) {
      setIsOpen(false);
    } else {
      setServerError(res.message || "Failed to log expense.");
    }
  };

  return (
    <>
      <Button onClick={() => handleOpenChange(true)} size="sm">
        <Plus className="h-4 w-4 mr-1.5" />
        Add Expense
      </Button>

      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetContent
          side={isMobile ? "bottom" : "right"}
          className="p-6 data-[side=right]:sm:max-w-2xl lg:data-[side=right]:max-w-3xl"
        >
          <SheetHeader className="mb-6 p-0">
            <SheetTitle>Log Expense</SheetTitle>
            <SheetDescription>
              Record a new spending transaction into your expense log.
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
                  <FieldLabel requiredLable htmlFor="exp-date">
                    Date
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id="exp-date"
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

            {/* Income Tagging */}
            <Controller
              control={form.control}
              name="incomeId"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor="exp-income">
                    Funded From Income (Tag)
                  </FieldLabel>
                  <FieldContent>
                    <select
                      {...field}
                      id="exp-income"
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
                  <FieldLabel requiredLable htmlFor="exp-category">
                    Category
                  </FieldLabel>
                  <FieldContent>
                    <select
                      {...field}
                      id="exp-category"
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
                    <FieldLabel htmlFor="exp-subcategory">
                      Sub Category (Optional)
                    </FieldLabel>
                    <FieldContent>
                      <select
                        {...field}
                        id="exp-subcategory"
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
                  <FieldLabel requiredLable htmlFor="exp-amount">
                    Amount
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      id="exp-amount"
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
                  <FieldLabel requiredLable htmlFor="exp-paymentMethod">
                    Payment Method
                  </FieldLabel>
                  <FieldContent>
                    <select
                      {...field}
                      id="exp-paymentMethod"
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
                  <FieldLabel htmlFor="exp-source">
                    Source (Optional)
                  </FieldLabel>
                  <FieldContent>
                    <select
                      {...field}
                      id="exp-source"
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
                  <FieldLabel requiredLable htmlFor="exp-type">
                    Spending Type
                  </FieldLabel>
                  <FieldContent>
                    <select
                      {...field}
                      id="exp-type"
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
                  <FieldLabel htmlFor="exp-description">
                    Description (Optional)
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      id="exp-description"
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
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && (
                  <Spinner size="sm" className="mr-2" />
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
