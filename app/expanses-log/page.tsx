import { ExpansesLogTableView } from "./_components/expanses-log-table-view";

export default function ExpansesLogPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Expense Logs</h1>
      <ExpansesLogTableView />
    </div>
  );
}
