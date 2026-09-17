import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateIncomeAction } from "@/app/(home)/income/lib/action";
import type { UpdateIncomeSchema } from "../lib/zod-type/income";

export function useUpdateIncomeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateIncomeSchema;
    }) => updateIncomeAction(id, input),
    onSuccess: (res) => {
      if (!res.success) return;
      queryClient.invalidateQueries({ queryKey: ["get-income"] });
    },
  });
}
