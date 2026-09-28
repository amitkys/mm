import { useMutation } from "@tanstack/react-query";
import { verifyPinAction } from "@/app/verify-pin/lib/action";
import { type PinSchema } from "@/app/setup-pin/lib/zod-type/pin";

export function useVerifyPinMutation() {
  return useMutation({
    mutationFn: (input: PinSchema) => verifyPinAction(input),
  });
}
