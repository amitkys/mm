"use server";

import { db } from "@/db";
import { userSecurity } from "@/db/schema/export";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers, cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { pinSchema, type PinSchema } from "./zod-type/pin";

/**
 * Sets the session-level PIN verified HTTP-only cookie.
 */
async function setPinVerifiedCookie() {
  const cookieStore = await cookies();
  cookieStore.set("mm_pin_verified", "true", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

/**
 * Clears the session-level PIN verified cookie.
 */
async function clearPinVerifiedCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("mm_pin_verified");
}

export async function getUserPinStatusAction() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, message: "User not authenticated" };

    const [record] = await db
      .select()
      .from(userSecurity)
      .where(eq(userSecurity.userId, session.user.id));

    if (!record) {
      return {
        success: true,
        data: {
          hasPin: false,
          isLocked: false,
        },
      };
    }

    const now = new Date();
    const isLocked = Boolean(record.lockedUntil && record.lockedUntil > now);
    const remainingLockTimeMs = isLocked
      ? record.lockedUntil!.getTime() - now.getTime()
      : 0;

    return {
      success: true,
      data: {
        hasPin: true,
        isLocked,
        remainingLockTimeMs,
        failedAttempts: record.failedAttempts,
      },
    };
  } catch (error) {
    console.error("getUserPinStatusAction error", error);
    return { success: false, message: "Failed to fetch PIN status" };
  }
}

export async function createPinAction(input: PinSchema) {
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

    const pinHash = await bcrypt.hash(parsed.data.pin, 10);

    const [existing] = await db
      .select()
      .from(userSecurity)
      .where(eq(userSecurity.userId, session.user.id));

    if (existing) {
      const [updated] = await db
        .update(userSecurity)
        .set({
          pinHash,
          failedAttempts: 0,
          lockedUntil: null,
          updatedAt: new Date(),
        })
        .where(eq(userSecurity.userId, session.user.id))
        .returning();

      await setPinVerifiedCookie();
      return { success: true, data: updated };
    }

    const [created] = await db
      .insert(userSecurity)
      .values({
        userId: session.user.id,
        pinHash,
        failedAttempts: 0,
      })
      .returning();

    await setPinVerifiedCookie();
    return { success: true, data: created };
  } catch (error) {
    console.error("createPinAction error", error);
    return { success: false, message: "Failed to set up security PIN" };
  }
}

export async function resetPinAction() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, message: "User not authenticated" };

    await db
      .delete(userSecurity)
      .where(eq(userSecurity.userId, session.user.id));

    await clearPinVerifiedCookie();
    return { success: true };
  } catch (error) {
    console.error("resetPinAction error", error);
    return { success: false, message: "Failed to reset security PIN" };
  }
}

export async function lockSessionAction() {
  try {
    await clearPinVerifiedCookie();
    return { success: true };
  } catch (error) {
    console.error("lockSessionAction error", error);
    return { success: false, message: "Failed to lock session" };
  }
}
