import { IncomeTableView } from "./_components/income-table-view";

export default function IncomePage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Income Management</h1>
      <IncomeTableView />
    </div>
  );
}
