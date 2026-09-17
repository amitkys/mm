"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { type ExpansesCategory } from "../query/get";
import { useUpdateExpansesCategoryMutation } from "../query/update";
import { useDeleteExpansesCategoryMutation } from "../query/delete";
import {
  updateExpansesCategorySchema,
  type UpdateExpansesCategorySchema,
} from "../lib/zod-type/expanses-category";
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

interface CategoryRowActionsProps {
  categoryItem: ExpansesCategory;
}

export function CategoryRowActions({ categoryItem }: CategoryRowActionsProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const updateMutation = useUpdateExpansesCategoryMutation();
  const deleteMutation = useDeleteExpansesCategoryMutation();

  const form = useForm<UpdateExpansesCategorySchema>({
    resolver: zodResolver(updateExpansesCategorySchema),
    defaultValues: {
      category: categoryItem.category,
      subCategory: categoryItem.subCategory ?? "",
    },
  });

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      form.reset({
        category: categoryItem.category,
        subCategory: categoryItem.subCategory ?? "",
      });
      setServerError(null);
    }
  };

  const handleSave = async (data: UpdateExpansesCategorySchema) => {
    setServerError(null);

    const res = await updateMutation.mutateAsync({
      id: categoryItem.id,
      input: {
        category: data.category.trim(),
        subCategory: data.subCategory?.trim() ? data.subCategory.trim() : null,
      },
    });

    if (res.success) {
      setIsOpen(false);
    } else {
      setServerError(res.message || "Failed to update category.");
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete "${categoryItem.category}${
          categoryItem.subCategory ? ` - ${categoryItem.subCategory}` : ""
        }"?`
      )
    ) {
      return;
    }

    setServerError(null);
    const res = await deleteMutation.mutateAsync(categoryItem.id);
    if (!res.success) {
      alert(res.message || "Failed to delete category.");
    }
  };

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          size="icon-xs"
          variant="ghost"
          onClick={() => handleOpenChange(true)}
          title="Edit Category"
        >
          <Edit className="h-3.5 w-3.5" />
        </Button>

        <Button
          size="icon-xs"
          variant="ghost"
          className="text-destructive hover:bg-destructive/10"
          onClick={handleDelete}
          disabled={
            deleteMutation.isPending ||
            (categoryItem.isDefault && categoryItem.userId === null)
          }
          title={
            categoryItem.isDefault && categoryItem.userId === null
              ? "System default categories cannot be deleted directly"
              : "Delete Category"
          }
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
            <SheetTitle>Edit Expense Category</SheetTitle>
            <SheetDescription>
              Make changes to the expense category details below.
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={form.handleSubmit(handleSave)}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <Controller
              control={form.control}
              name="category"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel requiredLable htmlFor="category-name">
                    Category Name
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      id="category-name"
                      type="text"
                      aria-invalid={fieldState.invalid}
                      placeholder="e.g. Food & Dining"
                    />
                    <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
                  </FieldContent>
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="subCategory"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor="sub-category-name">
                    Sub Category (Optional)
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      id="sub-category-name"
                      type="text"
                      aria-invalid={fieldState.invalid}
                      placeholder="e.g. Groceries"
                    />
                    <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
                  </FieldContent>
                </Field>
              )}
            />

            {categoryItem.isDefault && categoryItem.userId === null && (
              <p className="rounded-md bg-muted p-2.5 text-xs text-muted-foreground sm:col-span-2">
                Note: Editing a system default category will save a customized copy for your account.
              </p>
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
