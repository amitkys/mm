"use server";

import { db } from "@/db";
import { userSecurity } from "@/db/schema/export";
import { auth } from "@/lib/auth";
import { hashPin } from "@/lib/pin-crypto";
import { unlockPinSession } from "@/lib/pin-access";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { createPinSchema, type CreatePinSchema } from "./zod-type/pin";

export async function createPinAction(input: CreatePinSchema) {
  try {
    const parsed = createPinSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message || "Invalid input data",
      };
    }

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, message: "User not authenticated" };

    const [existing] = await db
      .select({ id: userSecurity.id })
      .from(userSecurity)
      .where(eq(userSecurity.userId, session.user.id));

    if (existing) {
      return { success: false, message: "Security PIN is already configured" };
    }

    const pinHash = await hashPin(parsed.data.pin);

    await db
      .insert(userSecurity)
      .values({
        userId: session.user.id,
        pinHash,
        failedAttempts: 0,
      });

    await unlockPinSession(session.session.id, session.user.id);
    return { success: true, data: { hasPin: true } };
  } catch (error) {
    console.error("createPinAction error", error);
    return { success: false, message: "Failed to set up security PIN" };
  }
}
