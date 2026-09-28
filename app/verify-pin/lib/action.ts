"use server";

import { auth } from "@/lib/auth";
import { lockPinSession, unlockPinSession } from "@/lib/pin-access";
import { verifyUserPin } from "@/lib/pin-verification";
import { headers } from "next/headers";
import { pinSchema, type PinSchema } from "@/app/setup-pin/lib/zod-type/pin";

export async function verifyPinAction(input: PinSchema) {
  try {
    const parsed = pinSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message || "Invalid PIN format",
      };
    }

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, message: "User not authenticated" };

    const verification = await verifyUserPin(session.user.id, parsed.data.pin);
    if (!verification.success) return verification;

    const unlockedUntil = await unlockPinSession(
      session.session.id,
      session.user.id
    );

    return { success: true, data: { unlockedUntil } };
  } catch (error) {
    console.error("verifyPinAction error", error);
    return { success: false, message: "Failed to verify PIN" };
  }
}

export async function lockPinSessionAction() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, message: "User not authenticated" };

    await lockPinSession(session.session.id, session.user.id);
    return { success: true, data: { locked: true } };
  } catch (error) {
    console.error("lockPinSessionAction error", error);
    return { success: false, message: "Failed to lock session" };
  }
}
