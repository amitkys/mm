import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createExpansesLogAction } from "@/app/expanses-log/lib/action";

export function useCreateExpansesLogMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createExpansesLogAction,
    onSuccess: (res) => {
      if (!res.success) return;
      queryClient.invalidateQueries({ queryKey: ["get-expanses-log"] });
    },
  });
}
