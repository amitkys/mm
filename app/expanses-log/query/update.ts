import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateExpansesLogAction } from "@/app/expanses-log/lib/action";

export function useUpdateExpansesLogMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Parameters<typeof updateExpansesLogAction>[1];
    }) => updateExpansesLogAction(id, input),
    onSuccess: (res) => {
      if (!res.success) return;
      queryClient.invalidateQueries({ queryKey: ["get-expanses-log"] });
    },
  });
}
