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

export type Income = NonNullable<
  ReturnType<typeof useGetIncomeQuery>["data"]
>[number];
