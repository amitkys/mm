import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createExpansesCategoryAction } from "@/app/(home)/expanses-category/lib/action";
import type { CreateExpansesCategorySchema } from "../lib/zod-type/expanses-category";

export function useCreateExpansesCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateExpansesCategorySchema) =>
      createExpansesCategoryAction(input),
    onSuccess: (res) => {
      if (!res.success) return;
      queryClient.invalidateQueries({ queryKey: ["get-expanses-category"] });
    },
  });
}
