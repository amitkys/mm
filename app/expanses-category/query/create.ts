import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createExpansesCategoryAction } from "@/app/expanses-category/lib/action";

export function useCreateExpansesCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { category: string; subCategory?: string | null }) =>
      createExpansesCategoryAction(input),
    onSuccess: (res) => {
      if (!res.success) return;
      queryClient.invalidateQueries({ queryKey: ["get-expanses-category"] });
    },
  });
}
