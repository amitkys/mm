import { ContentLayout } from "@/components/admin-panel/content-layout";
import { IncomeTableView } from "./_components/income-table-view";

export default function IncomePage() {
  return (
    <ContentLayout title="Income Management">
      <IncomeTableView />
    </ContentLayout>
  );
}
