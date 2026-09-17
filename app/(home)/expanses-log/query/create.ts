import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createExpansesLogAction } from "@/app/(home)/expanses-log/lib/action";
import type { CreateExpansesLogSchema } from "../lib/zod-type/expanses-log";

export function useCreateExpansesLogMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateExpansesLogSchema) =>
      createExpansesLogAction(input),
    onSuccess: (res) => {
      if (!res.success) return;
      queryClient.invalidateQueries({ queryKey: ["get-expanses-log"] });
    },
  });
}
