import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateExpansesLogAction } from "@/app/(home)/expanses-log/lib/action";
import type { UpdateExpansesLogSchema } from "../lib/zod-type/expanses-log";

export function useUpdateExpansesLogMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateExpansesLogSchema;
    }) => updateExpansesLogAction(id, input),
    onSuccess: (res) => {
      if (!res.success) return;
      queryClient.invalidateQueries({ queryKey: ["get-expanses-log"] });
    },
  });
}
