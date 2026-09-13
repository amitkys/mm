"use client";

import { useState } from "react";
import { type ExpansesCategory } from "../query/get";
import { useUpdateExpansesCategoryMutation } from "../query/update";
import { useDeleteExpansesCategoryMutation } from "../query/delete";
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

interface CategoryRowActionsProps {
  categoryItem: ExpansesCategory;
}

export function CategoryRowActions({ categoryItem }: CategoryRowActionsProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState(categoryItem.category);
  const [subCategory, setSubCategory] = useState(categoryItem.subCategory ?? "");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateMutation = useUpdateExpansesCategoryMutation();
  const deleteMutation = useDeleteExpansesCategoryMutation();

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setCategory(categoryItem.category);
      setSubCategory(categoryItem.subCategory ?? "");
      setErrorMessage(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!category.trim()) {
      setErrorMessage("Category name is required.");
      return;
    }

    const res = await updateMutation.mutateAsync({
      id: categoryItem.id,
      input: {
        category: category.trim(),
        subCategory: subCategory.trim() ? subCategory.trim() : null,
      },
    });

    if (res.success) {
      setIsOpen(false);
    } else {
      setErrorMessage(res.message || "Failed to update category.");
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

    setErrorMessage(null);
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
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>

      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetContent side={isMobile ? "bottom" : "right"} className="p-6 data-[side=right]:sm:max-w-2xl lg:data-[side=right]:max-w-3xl">
          <SheetHeader className="mb-6 p-0">
            <SheetTitle>Edit Expense Category</SheetTitle>
            <SheetDescription>
              Make changes to the expense category details below.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="category-name">Category Name</Label>
              <Input
                id="category-name"
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Food & Dining"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="sub-category-name">Sub Category (Optional)</Label>
              <Input
                id="sub-category-name"
                type="text"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                placeholder="e.g. Groceries"
              />
            </div>

            {categoryItem.isDefault && categoryItem.userId === null && (
              <p className="rounded-md bg-muted p-2.5 text-xs text-muted-foreground sm:col-span-2">
                Note: Editing a system default category will save a customized copy for your account.
              </p>
            )}

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
