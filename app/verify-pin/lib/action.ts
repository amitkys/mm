"use server";

import { db } from "@/db";
import { userSecurity } from "@/db/schema/export";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers, cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { pinSchema, type PinSchema } from "@/app/setup-pin/lib/zod-type/pin";

async function setPinVerifiedCookie() {
  const cookieStore = await cookies();
  cookieStore.set("mm_pin_verified", "true", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

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

    const [record] = await db
      .select()
      .from(userSecurity)
      .where(eq(userSecurity.userId, session.user.id));

    if (!record) {
      return { success: false, message: "No security PIN found. Please set up a PIN." };
    }

    const now = new Date();
    if (record.lockedUntil && record.lockedUntil > now) {
      const remainingMins = Math.ceil((record.lockedUntil.getTime() - now.getTime()) / 60000);
      return {
        success: false,
        isLocked: true,
        message: `Account is locked due to multiple failed attempts. Try again in ${remainingMins} minute(s).`,
      };
    }

    const isMatch = await bcrypt.compare(parsed.data.pin, record.pinHash);

    if (!isMatch) {
      const newAttempts = record.failedAttempts + 1;
      const MAX_ATTEMPTS = 5;

      let lockedUntil: Date | null = null;
      let message = `Incorrect PIN. ${MAX_ATTEMPTS - newAttempts} attempt(s) remaining.`;

      if (newAttempts >= MAX_ATTEMPTS) {
        lockedUntil = new Date(now.getTime() + 15 * 60 * 1000);
        message = "Account locked for 15 minutes due to 5 consecutive failed PIN attempts.";
      }

      await db
        .update(userSecurity)
        .set({
          failedAttempts: newAttempts,
          lockedUntil,
          updatedAt: new Date(),
        })
        .where(eq(userSecurity.userId, session.user.id));

      return {
        success: false,
        isLocked: Boolean(lockedUntil),
        message,
      };
    }

    // Reset failed attempts and set verified cookie
    await db
      .update(userSecurity)
      .set({
        failedAttempts: 0,
        lockedUntil: null,
        updatedAt: new Date(),
      })
      .where(eq(userSecurity.userId, session.user.id));

    await setPinVerifiedCookie();
    return { success: true };
  } catch (error) {
    console.error("verifyPinAction error", error);
    return { success: false, message: "Failed to verify PIN" };
  }
}
