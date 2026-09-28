import { queryOptions, useQuery } from "@tanstack/react-query";
import { getDashboardTagsAction } from "@/app/(home)/dashboard/lib/action";

export function getDashboardTagsQuery(month: string) {
  return queryOptions({
    queryKey: ["get-dashboard-tags", month],
    queryFn: async () => {
      const result = await getDashboardTagsAction(month);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
  });
}

export function useGetDashboardTagsQuery(month: string) {
  return useQuery(getDashboardTagsQuery(month));
}

export type DashboardTag = NonNullable<ReturnType<typeof useGetDashboardTagsQuery>["data"]>[number];
