import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createIncomeAction } from "@/app/income/lib/action";

export function useCreateIncomeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createIncomeAction,
    onSuccess: (res) => {
      if (!res.success) return;
      queryClient.invalidateQueries({ queryKey: ["get-income"] });
    },
  });
}
