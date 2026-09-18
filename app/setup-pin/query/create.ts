import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPinAction, resetPinAction } from "@/app/setup-pin/lib/action";
import { type PinSchema } from "@/app/setup-pin/lib/zod-type/pin";

export function useCreatePinMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: PinSchema) => createPinAction(input),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["get-user-pin-status"] });
      }
    },
  });
}

export function useResetPinMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => resetPinAction(),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["get-user-pin-status"] });
      }
    },
  });
}
