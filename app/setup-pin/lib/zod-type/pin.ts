import { z } from "zod";

const COMMON_PINS = new Set([
  "000000",
  "111111",
  "123456",
  "654321",
  "121212",
  "112233",
]);

export const pinSchema = z.object({
  pin: z
    .string()
    .regex(/^\d{4}$|^\d{6}$/, { error: "Enter your 4 or 6 digit PIN" }),
});

const newPinSchema = z
  .string()
  .regex(/^\d{6}$/, { error: "PIN must be exactly 6 numeric digits" })
  .refine((pin) => !COMMON_PINS.has(pin) && !/^(\d)\1{5}$/.test(pin), {
    error: "Choose a less common PIN",
  });

export const createPinSchema = z
  .object({
    pin: newPinSchema,
    confirmPin: z.string(),
  })
  .superRefine(({ pin, confirmPin }, context) => {
    if (pin !== confirmPin) {
      context.addIssue({
        code: "custom",
        message: "PINs do not match",
        path: ["confirmPin"],
      });
    }
  });

export const changePinSchema = z
  .object({
    currentPin: pinSchema.shape.pin,
    newPin: newPinSchema,
    confirmPin: z.string(),
  })
  .superRefine(({ currentPin, newPin, confirmPin }, context) => {
    if (newPin !== confirmPin) {
      context.addIssue({
        code: "custom",
        message: "PINs do not match",
        path: ["confirmPin"],
      });
    }

    if (currentPin === newPin) {
      context.addIssue({
        code: "custom",
        message: "New PIN must be different from the current PIN",
        path: ["newPin"],
      });
    }
  });

export type PinSchema = z.infer<typeof pinSchema>;
export type CreatePinSchema = z.infer<typeof createPinSchema>;
export type ChangePinSchema = z.infer<typeof changePinSchema>;
