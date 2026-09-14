import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Sparkles, Clock, LayoutDashboard } from "lucide-react";

export default function DashboardPage() {
  return (
    <ContentLayout title="Dashboard">
      <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 p-8 text-center shadow-xs">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <LayoutDashboard className="h-8 w-8" />
        </div>

        <div className="mb-2 flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
          <Clock className="h-3.5 w-3.5" />
          <span>Under Development</span>
        </div>

        <h2 className="mb-2 text-2xl font-bold tracking-tight text-foreground">
          Dashboard Coming Soon
        </h2>
      </div>
    </ContentLayout>
  );
}
