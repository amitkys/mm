import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateExpansesCategoryAction } from "@/app/(home)/expanses-category/lib/action";
import type { UpdateExpansesCategorySchema } from "../lib/zod-type/expanses-category";

export function useUpdateExpansesCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateExpansesCategorySchema;
    }) => updateExpansesCategoryAction(id, input),
    onSuccess: (res) => {
      if (!res.success) return;
      queryClient.invalidateQueries({ queryKey: ["get-expanses-category"] });
    },
  });
}
