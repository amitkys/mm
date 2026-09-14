import { ContentLayout } from "@/components/admin-panel/content-layout";
import { ExpansesLogTableView } from "./_components/expanses-log-table-view";

export default function ExpansesLogPage() {
  return (
    <ContentLayout title="Expense Logs">
      <ExpansesLogTableView />
    </ContentLayout>
  );
}
