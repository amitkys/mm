import { queryOptions, useQuery } from "@tanstack/react-query";
import { getIncomeAction } from "@/app/(home)/income/lib/action";

export function getIncomeQuery() {
  return queryOptions({
    queryKey: ["get-income"],
    queryFn: async () => {
      const res = await getIncomeAction();
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });
}

export function useGetIncomeQuery() {
  return useQuery(getIncomeQuery());
}

import { type ExpansesLog } from "@/app/(home)/expanses-log/query/get";

export type Income = NonNullable<
  ReturnType<typeof useGetIncomeQuery>["data"]
>[number];

export type EnrichedIncome = Income & {
  totalSpent?: number;
  remaining?: number;
  spentPercent?: number;
  taggedLogs?: ExpansesLog[];
  onOpenSheet?: (income: EnrichedIncome) => void;
};
