type PrintableExpense = { category: string; amount: string };

/** Groups the already-filtered print entries by category, using integer cents for totals. */
export function groupPrintExpensesByCategory<T extends PrintableExpense>(logs: readonly T[]) {
  const categories = new Map<string, { logs: T[]; amountCents: number }>();
  let reportTotalCents = 0;

  for (const log of logs) {
    const amountCents = Math.round(Number(log.amount) * 100);
    reportTotalCents += amountCents;
    const group = categories.get(log.category) ?? { logs: [], amountCents: 0 };
    group.logs.push(log);
    group.amountCents += amountCents;
    categories.set(log.category, group);
  }

  return [...categories.entries()]
    .sort((a, b) => b[1].amountCents - a[1].amountCents || a[0].localeCompare(b[0]))
    .map(([category, group]) => ({
      category,
      logs: group.logs,
      amount: group.amountCents / 100,
      percentage: reportTotalCents ? (group.amountCents / reportTotalCents) * 100 : 0,
    }));
}
