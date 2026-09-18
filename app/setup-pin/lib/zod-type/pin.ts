import { z } from "zod";

export const pinSchema = z.object({
  pin: z.string().regex(/^\d{4}$/, "PIN must be exactly 4 numeric digits"),
});

export type PinSchema = z.infer<typeof pinSchema>;
