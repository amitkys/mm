import { useMutation } from "@tanstack/react-query";
import { lockPinSessionAction } from "@/app/verify-pin/lib/action";

export function useLockPinSessionMutation() {
  return useMutation({
    mutationFn: lockPinSessionAction,
  });
}
