import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { getPinAccessState } from "@/lib/pin-access";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const access = await getPinAccessState();

    if (access.status === "unauthenticated") redirect("/signin");
    if (access.status === "setup_required") redirect("/setup-pin");
    if (access.status === "locked") redirect("/verify-pin");

    return <AdminPanelLayout>{children}</AdminPanelLayout>;
}
