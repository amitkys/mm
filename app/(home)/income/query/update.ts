import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateIncomeAction } from "@/app/(home)/income/lib/action";

export function useUpdateIncomeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Parameters<typeof updateIncomeAction>[1];
    }) => updateIncomeAction(id, input),
    onSuccess: (res) => {
      if (!res.success) return;
      queryClient.invalidateQueries({ queryKey: ["get-income"] });
    },
  });
}
