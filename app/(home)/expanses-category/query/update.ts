import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateExpansesCategoryAction } from "@/app/(home)/expanses-category/lib/action";

export function useUpdateExpansesCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: { category?: string; subCategory?: string | null };
    }) => updateExpansesCategoryAction(id, input),
    onSuccess: (res) => {
      if (!res.success) return;
      queryClient.invalidateQueries({ queryKey: ["get-expanses-category"] });
    },
  });
}
