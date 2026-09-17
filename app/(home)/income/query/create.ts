import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createIncomeAction } from "@/app/(home)/income/lib/action";
import type { CreateIncomeSchema } from "../lib/zod-type/income";

export function useCreateIncomeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateIncomeSchema) => createIncomeAction(input),
    onSuccess: (res) => {
      if (!res.success) return;
      queryClient.invalidateQueries({ queryKey: ["get-income"] });
    },
  });
}
