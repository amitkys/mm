// redirect to expanses-logs url

import { redirect } from "next/navigation";

export default function HomePage() {
    redirect("/expanses-log");
}