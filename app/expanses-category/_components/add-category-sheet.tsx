"use client";

import { useState } from "react";
import { type ExpansesCategory } from "../query/get";
import { useCreateExpansesCategoryMutation } from "../query/create";
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

interface AddCategorySheetProps {
  categories: ExpansesCategory[];
}

const NEW_OPTION_VALUE = "__NEW__";

export function AddCategorySheet({ categories }: AddCategorySheetProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [categorySelect, setCategorySelect] = useState<string>("");
  const [customCategory, setCustomCategory] = useState<string>("");
  const [subCategorySelect, setSubCategorySelect] = useState<string>("");
  const [customSubCategory, setCustomSubCategory] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createMutation = useCreateExpansesCategoryMutation();

  // Extract unique category names
  const existingCategories = Array.from(
    new Set(categories.map((c) => c.category))
  ).sort();

  // Extract unique subcategories for currently selected category
  const existingSubCategories =
    categorySelect && categorySelect !== NEW_OPTION_VALUE
      ? Array.from(
          new Set(
            categories
              .filter((c) => c.category === categorySelect && c.subCategory)
              .map((c) => c.subCategory!)
          )
        ).sort()
      : [];

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setCategorySelect(existingCategories[0] || NEW_OPTION_VALUE);
      setCustomCategory("");
      setSubCategorySelect("");
      setCustomSubCategory("");
      setErrorMessage(null);
    }
  };

  const handleCategorySelectChange = (val: string) => {
    setCategorySelect(val);
    setSubCategorySelect("");
    setCustomSubCategory("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const finalCategory =
      categorySelect === NEW_OPTION_VALUE
        ? customCategory.trim()
        : categorySelect.trim();

    if (!finalCategory) {
      setErrorMessage("Please select or enter a category name.");
      return;
    }

    let finalSubCategory: string | null = null;
    if (categorySelect === NEW_OPTION_VALUE) {
      finalSubCategory = customSubCategory.trim() ? customSubCategory.trim() : null;
    } else if (subCategorySelect === NEW_OPTION_VALUE) {
      finalSubCategory = customSubCategory.trim() ? customSubCategory.trim() : null;
    } else if (subCategorySelect) {
      finalSubCategory = subCategorySelect.trim();
    }

    const res = await createMutation.mutateAsync({
      category: finalCategory,
      subCategory: finalSubCategory,
    });

    if (res.success) {
      setIsOpen(false);
    } else {
      setErrorMessage(res.message || "Failed to create expense category.");
    }
  };

  return (
    <>
      <Button onClick={() => handleOpenChange(true)} size="sm">
        <Plus className="h-4 w-4 mr-1.5" />
        Add Category
      </Button>

      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetContent side={isMobile ? "bottom" : "right"} className="p-6 sm:max-w-md">
          <SheetHeader className="mb-6 p-0">
            <SheetTitle>Add Expense Category</SheetTitle>
            <SheetDescription>
              Select an existing category or create a new category / sub-category.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Category Selection */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="category-select">Category</Label>
              <select
                id="category-select"
                value={categorySelect}
                onChange={(e) => handleCategorySelectChange(e.target.value)}
                className="h-9 w-full min-w-0 rounded-3xl border border-transparent bg-input/50 px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
              >
                {existingCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value={NEW_OPTION_VALUE}>+ Add New Category</option>
              </select>
            </div>

            {/* Custom Category Input if New Selected */}
            {categorySelect === NEW_OPTION_VALUE && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="custom-category">New Category Name</Label>
                <Input
                  id="custom-category"
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="e.g. Subscriptions"
                  required
                />
              </div>
            )}

            {/* Sub-Category Selection */}
            {categorySelect !== NEW_OPTION_VALUE ? (
              <div className="flex flex-col gap-2">
                <Label htmlFor="subcategory-select">Sub Category</Label>
                <select
                  id="subcategory-select"
                  value={subCategorySelect}
                  onChange={(e) => setSubCategorySelect(e.target.value)}
                  className="h-9 w-full min-w-0 rounded-3xl border border-transparent bg-input/50 px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
                >
                  <option value="">None (No Sub Category)</option>
                  {existingSubCategories.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                  <option value={NEW_OPTION_VALUE}>+ Add New Sub Category</option>
                </select>
              </div>
            ) : null}

            {/* Custom Sub-Category Input if New Sub-Category or New Category selected */}
            {(categorySelect === NEW_OPTION_VALUE ||
              subCategorySelect === NEW_OPTION_VALUE) && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="custom-sub-category">
                  {categorySelect === NEW_OPTION_VALUE
                    ? "Sub Category Name (Optional)"
                    : "New Sub Category Name"}
                </Label>
                <Input
                  id="custom-sub-category"
                  type="text"
                  value={customSubCategory}
                  onChange={(e) => setCustomSubCategory(e.target.value)}
                  placeholder="e.g. Streaming Services"
                  required={subCategorySelect === NEW_OPTION_VALUE}
                />
              </div>
            )}

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
                Add Category
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
