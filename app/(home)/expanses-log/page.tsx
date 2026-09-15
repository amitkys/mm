import { Suspense } from "react";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { ExpansesLogTableView } from "./_components/expanses-log-table-view";
import { Loader2 } from "lucide-react";

export default function ExpansesLogPage() {
  return (
    <ContentLayout title="Expense Logs">
      <Suspense
        fallback={
          <div className="flex h-48 items-center justify-center rounded-md border">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
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
