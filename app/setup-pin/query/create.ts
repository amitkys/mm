import { useMutation } from "@tanstack/react-query";
import { createPinAction } from "@/app/setup-pin/lib/action";
import { type CreatePinSchema } from "@/app/setup-pin/lib/zod-type/pin";

export function useCreatePinMutation() {
  return useMutation({
    mutationFn: (input: CreatePinSchema) => createPinAction(input),
  });
}
