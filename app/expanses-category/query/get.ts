import { queryOptions, useQuery } from "@tanstack/react-query";
import { getExpansesCategoryAction } from "@/app/expanses-category/lib/action";

export function getExpansesCategoryQuery() {
  return queryOptions({
    queryKey: ["get-expanses-category"],
    queryFn: async () => {
      const res = await getExpansesCategoryAction();
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });
}

export function useGetExpansesCategoryQuery() {
  return useQuery(getExpansesCategoryQuery());
}

export type ExpansesCategory = NonNullable<
  ReturnType<typeof useGetExpansesCategoryQuery>["data"]
>[number];
