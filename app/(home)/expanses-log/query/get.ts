import { queryOptions, useQuery } from "@tanstack/react-query";
import { getExpansesLogAction } from "@/app/(home)/expanses-log/lib/action";

export function getExpansesLogQuery() {
  return queryOptions({
    queryKey: ["get-expanses-log"],
    queryFn: async () => {
      const res = await getExpansesLogAction();
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });
}

export function useGetExpansesLogQuery() {
  return useQuery(getExpansesLogQuery());
}

export type ExpansesLog = NonNullable<
  ReturnType<typeof useGetExpansesLogQuery>["data"]
>[number];
