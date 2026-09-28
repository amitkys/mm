import { queryOptions, useQuery } from "@tanstack/react-query";
import { getDashboardAction } from "@/app/(home)/dashboard/lib/action";

export function getDashboardQuery(month: string, tagId: string) {
  return queryOptions({
    queryKey: ["get-dashboard", month, tagId],
    queryFn: async () => {
      const result = await getDashboardAction(month, tagId);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
  });
}

export function useGetDashboardQuery(month: string, tagId: string) {
  return useQuery(getDashboardQuery(month, tagId));
}

export type DashboardData = NonNullable<ReturnType<typeof useGetDashboardQuery>["data"]>;
