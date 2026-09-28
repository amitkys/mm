import { ContentLayout } from "@/components/admin-panel/content-layout";
import { DashboardView } from "./_components/dashboard-view";

export default function DashboardPage() {
  const currentMonth = new Date().toISOString().slice(0, 7);
  return (
    <ContentLayout title="Dashboard">
      <DashboardView initialMonth={currentMonth} />
    </ContentLayout>
  );
}
