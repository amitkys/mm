"use client";

import { REGEXP_ONLY_DIGITS } from "input-otp";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export function PinInput({
  value,
  onChange,
  onBlur,
  name,
  invalid,
  disabled = false,
  autoFocus = false,
}: {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  name: string;
  invalid: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}) {
  return (
    <InputOTP
      maxLength={6}
      pattern={REGEXP_ONLY_DIGITS}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      name={name}
      disabled={disabled}
      autoFocus={autoFocus}
    >
      <InputOTPGroup className="gap-1 sm:gap-2">
        {[0, 1, 2].map((index) => (
          <InputOTPSlot
            key={index}
            index={index}
            aria-invalid={invalid}
            className="size-8 sm:size-12"
          />
        ))}
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup className="gap-1 sm:gap-2">
        {[3, 4, 5].map((index) => (
          <InputOTPSlot
            key={index}
            index={index}
            aria-invalid={invalid}
            className="size-8 sm:size-12"
          />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}
