import { db } from "@/db";
import { userSecurity } from "@/db/schema/export";
import { hashPin, verifyPinHash } from "@/lib/pin-crypto";
import { eq } from "drizzle-orm";

const MAX_PIN_ATTEMPTS = 5;
const PIN_LOCK_DURATION_MS = 15 * 60 * 1000;

export async function verifyUserPin(
  userId: string,
  pin: string,
  replacementHash?: string
) {
  return db.transaction(async (tx) => {
    const [record] = await tx
      .select()
      .from(userSecurity)
      .where(eq(userSecurity.userId, userId))
      .limit(1)
      .for("update");

    if (!record) {
      return { success: false as const, message: "Security PIN is not configured" };
    }

    const now = new Date();
    if (record.lockedUntil && record.lockedUntil > now) {
      const remainingMinutes = Math.ceil(
        (record.lockedUntil.getTime() - now.getTime()) / 60_000
      );

      return {
        success: false as const,
        message: `Too many attempts. Try again in ${remainingMinutes} minute(s).`,
      };
    }

    const matches = await verifyPinHash(record.pinHash, pin);

    if (!matches) {
      const previousAttempts =
        record.lockedUntil && record.lockedUntil <= now
          ? 0
          : record.failedAttempts;
      const failedAttempts = previousAttempts + 1;
      const lockedUntil =
        failedAttempts >= MAX_PIN_ATTEMPTS
          ? new Date(now.getTime() + PIN_LOCK_DURATION_MS)
          : null;

      await tx
        .update(userSecurity)
        .set({ failedAttempts, lockedUntil, updatedAt: now })
        .where(eq(userSecurity.id, record.id));

      return {
        success: false as const,
        message: lockedUntil
          ? "Too many attempts. Try again in 15 minutes."
          : `Incorrect PIN. ${MAX_PIN_ATTEMPTS - failedAttempts} attempt(s) remaining.`,
      };
    }

    const nextHash = replacementHash ?? (
      record.pinHash.startsWith("$2") ? await hashPin(pin) : record.pinHash
    );

    await tx
      .update(userSecurity)
      .set({
        pinHash: nextHash,
        failedAttempts: 0,
        lockedUntil: null,
        updatedAt: now,
      })
      .where(eq(userSecurity.id, record.id));

    return { success: true as const };
  });
}
