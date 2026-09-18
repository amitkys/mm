import { queryOptions, useQuery } from "@tanstack/react-query";
import { getUserPinStatusAction } from "@/app/setup-pin/lib/action";

export function getUserPinStatusQuery() {
  return queryOptions({
    queryKey: ["get-user-pin-status"],
    queryFn: async () => {
      const res = await getUserPinStatusAction();
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });
}

export function useGetUserPinStatusQuery(enabled = true) {
  return useQuery({
    ...getUserPinStatusQuery(),
    enabled,
  });
}
