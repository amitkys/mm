import { db } from "@/db";
import { session as sessionTable, userSecurity } from "@/db/schema/export";
import { auth } from "@/lib/auth";
import { and, eq, gt } from "drizzle-orm";
import { headers } from "next/headers";

export const PIN_UNLOCK_DURATION_MS = 30 * 60 * 1000;

type PinAccessHeaders = Headers | undefined;

export async function getPinAccessState(requestHeaders?: PinAccessHeaders) {
  const authSession = await auth.api.getSession({
    headers: requestHeaders ?? (await headers()),
  });

  if (!authSession) {
    return { status: "unauthenticated" as const };
  }

  const now = new Date();
  const [securityRecord, unlockedSession] = await Promise.all([
    db
      .select({ id: userSecurity.id })
      .from(userSecurity)
      .where(eq(userSecurity.userId, authSession.user.id))
      .limit(1),
    db
      .select({ id: sessionTable.id })
      .from(sessionTable)
      .where(
        and(
          eq(sessionTable.id, authSession.session.id),
          eq(sessionTable.userId, authSession.user.id),
          gt(sessionTable.pinUnlockedUntil, now)
        )
      )
      .limit(1),
  ]);

  if (!securityRecord[0]) {
    return { status: "setup_required" as const, session: authSession };
  }

  if (!unlockedSession[0]) {
    return { status: "locked" as const, session: authSession };
  }

  return { status: "unlocked" as const, session: authSession };
}

export async function requireUnlockedSession() {
  const access = await getPinAccessState();

  if (access.status === "unauthenticated") {
    return { success: false as const, message: "User not authenticated" };
  }

  if (access.status !== "unlocked") {
    return { success: false as const, message: "Security PIN verification required" };
  }

  return { success: true as const, session: access.session };
}

export async function unlockPinSession(sessionId: string, userId: string) {
  const now = new Date();
  const unlockedUntil = new Date(now.getTime() + PIN_UNLOCK_DURATION_MS);

  const [updated] = await db
    .update(sessionTable)
    .set({
      pinVerifiedAt: now,
      pinUnlockedUntil: unlockedUntil,
    })
    .where(and(eq(sessionTable.id, sessionId), eq(sessionTable.userId, userId)))
    .returning({ id: sessionTable.id });

  if (!updated) {
    throw new Error("Current authentication session was not found");
  }

  return unlockedUntil;
}

export async function lockPinSession(sessionId: string, userId: string) {
  await db
    .update(sessionTable)
    .set({ pinVerifiedAt: null, pinUnlockedUntil: null })
    .where(and(eq(sessionTable.id, sessionId), eq(sessionTable.userId, userId)));
}
