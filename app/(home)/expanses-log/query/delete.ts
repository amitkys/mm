import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteExpansesLogAction } from "@/app/(home)/expanses-log/lib/action";

export function useDeleteExpansesLogMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteExpansesLogAction(id),
    onSuccess: (res) => {
      if (!res.success) return;
      queryClient.invalidateQueries({ queryKey: ["get-expanses-log"] });
    },
  });
}
