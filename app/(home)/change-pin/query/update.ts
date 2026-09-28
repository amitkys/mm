import { useMutation } from "@tanstack/react-query";
import { changePinAction } from "@/app/(home)/change-pin/lib/action";
import { type ChangePinSchema } from "@/app/setup-pin/lib/zod-type/pin";

export function useChangePinMutation() {
  return useMutation({
    mutationFn: (input: ChangePinSchema) => changePinAction(input),
  });
}
