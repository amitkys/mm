import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteExpansesCategoryAction } from "@/app/(home)/expanses-category/lib/action";

export function useDeleteExpansesCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteExpansesCategoryAction(id),
    onSuccess: (res) => {
      if (!res.success) return;
      queryClient.invalidateQueries({ queryKey: ["get-expanses-category"] });
    },
  });
}
