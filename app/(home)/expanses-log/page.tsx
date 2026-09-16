import { Suspense } from "react";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { ExpansesLogTableView } from "./_components/expanses-log-table-view";
import { Spinner } from "@/components/ui/spinner";

export default function ExpansesLogPage() {
  return (
    <ContentLayout title="Expense Logs">
      <Suspense
        fallback={
          <div className="flex h-48 items-center justify-center rounded-md border">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Spinner size="lg" />
              <span>Loading expense logs...</span>
            </div>
          </div>
        }
      >
        <ExpansesLogTableView />
      </Suspense>
    </ContentLayout>
  );
}
