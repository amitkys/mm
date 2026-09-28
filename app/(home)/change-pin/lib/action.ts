"use server";

import { db } from "@/db";
import { session as sessionTable } from "@/db/schema/export";
import {
  changePinSchema,
  type ChangePinSchema,
} from "@/app/setup-pin/lib/zod-type/pin";
import { hashPin } from "@/lib/pin-crypto";
import { PIN_UNLOCK_DURATION_MS, requireUnlockedSession } from "@/lib/pin-access";
import { verifyUserPin } from "@/lib/pin-verification";
import { and, eq } from "drizzle-orm";

export async function changePinAction(input: ChangePinSchema) {
  try {
    const parsed = changePinSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message || "Invalid input data",
      };
    }

    const access = await requireUnlockedSession();
    if (!access.success) return access;

    const pinHash = await hashPin(parsed.data.newPin);
    const verification = await verifyUserPin(
      access.session.user.id,
      parsed.data.currentPin,
      pinHash
    );
    if (!verification.success) return verification;

    const now = new Date();
    const unlockedUntil = new Date(now.getTime() + PIN_UNLOCK_DURATION_MS);

    await db.transaction(async (tx) => {
      await tx
        .update(sessionTable)
        .set({ pinVerifiedAt: null, pinUnlockedUntil: null })
        .where(eq(sessionTable.userId, access.session.user.id));

      await tx
        .update(sessionTable)
        .set({ pinVerifiedAt: now, pinUnlockedUntil: unlockedUntil })
        .where(
          and(
            eq(sessionTable.id, access.session.session.id),
            eq(sessionTable.userId, access.session.user.id)
          )
        );
    });

    return { success: true, data: { changed: true } };
  } catch (error) {
    console.error("changePinAction error", error);
    return { success: false, message: "Failed to change security PIN" };
  }
}
