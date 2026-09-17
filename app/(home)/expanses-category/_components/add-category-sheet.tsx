"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { type ExpansesCategory } from "../query/get";
import { useCreateExpansesCategoryMutation } from "../query/create";
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

interface AddCategorySheetProps {
  categories: ExpansesCategory[];
}

const NEW_OPTION_VALUE = "__NEW__";

const addCategoryFormSchema = z
  .object({
    categorySelect: z
      .string()
      .min(1, { error: "Category selection is required" }),
    customCategory: z.string().optional(),
    subCategorySelect: z.string().optional(),
    customSubCategory: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.categorySelect === NEW_OPTION_VALUE &&
      (!data.customCategory || !data.customCategory.trim())
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["customCategory"],
        message: "New category name is required",
      });
    }
    if (
      data.subCategorySelect === NEW_OPTION_VALUE &&
      (!data.customSubCategory || !data.customSubCategory.trim())
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["customSubCategory"],
        message: "New sub category name is required",
      });
    }
  });

type AddCategoryFormValues = z.infer<typeof addCategoryFormSchema>;

export function AddCategorySheet({ categories }: AddCategorySheetProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const createMutation = useCreateExpansesCategoryMutation();

  const existingCategories = Array.from(
    new Set(categories.map((c) => c.category))
  ).sort();

  const form = useForm<AddCategoryFormValues>({
    resolver: zodResolver(addCategoryFormSchema),
    defaultValues: {
      categorySelect: existingCategories[0] || NEW_OPTION_VALUE,
      customCategory: "",
      subCategorySelect: "",
      customSubCategory: "",
    },
  });

  const categorySelectWatch = form.watch("categorySelect");
  const subCategorySelectWatch = form.watch("subCategorySelect");

  const existingSubCategories =
    categorySelectWatch && categorySelectWatch !== NEW_OPTION_VALUE
      ? Array.from(
          new Set(
            categories
              .filter((c) => c.category === categorySelectWatch && c.subCategory)
              .map((c) => c.subCategory!)
          )
        ).sort()
      : [];

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      form.reset({
        categorySelect: existingCategories[0] || NEW_OPTION_VALUE,
        customCategory: "",
        subCategorySelect: "",
        customSubCategory: "",
      });
      setServerError(null);
    }
  };

  const onSubmit = async (data: AddCategoryFormValues) => {
    setServerError(null);

    const finalCategory =
      data.categorySelect === NEW_OPTION_VALUE
        ? data.customCategory!.trim()
        : data.categorySelect.trim();

    let finalSubCategory: string | null = null;
    if (data.categorySelect === NEW_OPTION_VALUE) {
      finalSubCategory = data.customSubCategory?.trim()
        ? data.customSubCategory.trim()
        : null;
    } else if (data.subCategorySelect === NEW_OPTION_VALUE) {
      finalSubCategory = data.customSubCategory?.trim()
        ? data.customSubCategory.trim()
        : null;
    } else if (data.subCategorySelect) {
      finalSubCategory = data.subCategorySelect.trim();
    }

    const res = await createMutation.mutateAsync({
      category: finalCategory,
      subCategory: finalSubCategory,
    });

    if (res.success) {
      setIsOpen(false);
    } else {
      setServerError(res.message || "Failed to create expense category.");
    }
  };

  return (
    <>
      <Button onClick={() => handleOpenChange(true)} size="sm">
        <Plus className="h-4 w-4 mr-1.5" />
        Add Category
      </Button>

      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetContent
          side={isMobile ? "bottom" : "right"}
          className="p-6 data-[side=right]:sm:max-w-2xl lg:data-[side=right]:max-w-3xl"
        >
          <SheetHeader className="mb-6 p-0">
            <SheetTitle>Add Expense Category</SheetTitle>
            <SheetDescription>
              Select an existing category or create a new category / sub-category.
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {/* Category Selection */}
            <Controller
              control={form.control}
              name="categorySelect"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel requiredLable htmlFor="category-select">
                    Category
                  </FieldLabel>
                  <FieldContent>
                    <select
                      {...field}
                      id="category-select"
                      aria-invalid={fieldState.invalid}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        form.setValue("subCategorySelect", "");
                        form.setValue("customSubCategory", "");
                      }}
                      className="h-9 w-full min-w-0 rounded-3xl border border-transparent bg-input/50 px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
                    >
                      {existingCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                      <option value={NEW_OPTION_VALUE}>
                        + Add New Category
                      </option>
                    </select>
                    <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
                  </FieldContent>
                </Field>
              )}
            />

            {/* Custom Category Input if New Selected */}
            {categorySelectWatch === NEW_OPTION_VALUE && (
              <Controller
                control={form.control}
                name="customCategory"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid || undefined}>
                    <FieldLabel requiredLable htmlFor="custom-category">
                      New Category Name
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        {...field}
                        id="custom-category"
                        type="text"
                        aria-invalid={fieldState.invalid}
                        placeholder="e.g. Subscriptions"
                      />
                      <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
                    </FieldContent>
                  </Field>
                )}
              />
            )}

            {/* Sub-Category Selection */}
            {categorySelectWatch !== NEW_OPTION_VALUE ? (
              <Controller
                control={form.control}
                name="subCategorySelect"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid || undefined}>
                    <FieldLabel htmlFor="subcategory-select">
                      Sub Category
                    </FieldLabel>
                    <FieldContent>
                      <select
                        {...field}
                        id="subcategory-select"
                        aria-invalid={fieldState.invalid}
                        className="h-9 w-full min-w-0 rounded-3xl border border-transparent bg-input/50 px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
                      >
                        <option value="">None (No Sub Category)</option>
                        {existingSubCategories.map((sub) => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))}
                        <option value={NEW_OPTION_VALUE}>
                          + Add New Sub Category
                        </option>
                      </select>
                      <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
                    </FieldContent>
                  </Field>
                )}
              />
            ) : null}

            {/* Custom Sub-Category Input if New Sub-Category or New Category selected */}
            {(categorySelectWatch === NEW_OPTION_VALUE ||
              subCategorySelectWatch === NEW_OPTION_VALUE) && (
              <Controller
                control={form.control}
                name="customSubCategory"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid || undefined}>
                    <FieldLabel
                      requiredLable={subCategorySelectWatch === NEW_OPTION_VALUE}
                      htmlFor="custom-sub-category"
                    >
                      {categorySelectWatch === NEW_OPTION_VALUE
                        ? "Sub Category Name (Optional)"
                        : "New Sub Category Name"}
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        {...field}
                        id="custom-sub-category"
                        type="text"
                        aria-invalid={fieldState.invalid}
                        placeholder="e.g. Streaming Services"
                      />
                      <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
                    </FieldContent>
                  </Field>
                )}
              />
            )}

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
                Add Category
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
