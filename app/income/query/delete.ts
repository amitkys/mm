import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteIncomeAction } from "@/app/income/lib/action";

export function useDeleteIncomeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteIncomeAction(id),
    onSuccess: (res) => {
      if (!res.success) return;
      queryClient.invalidateQueries({ queryKey: ["get-income"] });
    },
  });
}
