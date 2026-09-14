import { ContentLayout } from "@/components/admin-panel/content-layout";
import { CategoryTableView } from "./_components/category-table-view";

export default function ExpansesCategoryPage() {
  return (
    <ContentLayout title="Expense Categories">
      <CategoryTableView />
    </ContentLayout>
  );
}