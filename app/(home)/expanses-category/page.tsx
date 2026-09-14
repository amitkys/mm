import { CategoryTableView } from "./_components/category-table-view";

export default function ExpansesCategoryPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Expense Categories</h1>
      <CategoryTableView />
    </div>
  );
}