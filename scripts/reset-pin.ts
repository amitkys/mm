import "dotenv/config";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { session, user, userSecurity } from "@/db/schema/export";

const emailSchema = z.email({ error: "Provide a valid email address" });

async function resetPinByEmail(email: string) {
  const [account] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  if (!account) {
    throw new Error("No user was found with that email address");
  }

  const result = await db.transaction(async (tx) => {
    const deletedSessions = await tx
      .delete(session)
      .where(eq(session.userId, account.id))
      .returning({ id: session.id });

    const deletedPinRecords = await tx
      .delete(userSecurity)
      .where(eq(userSecurity.userId, account.id))
      .returning({ id: userSecurity.id });

    return {
      sessionCount: deletedSessions.length,
      pinWasConfigured: deletedPinRecords.length > 0,
    };
  });

  return result;
}

async function main() {
  const parsedEmail = emailSchema.safeParse(process.argv[2]?.trim().toLowerCase());

  if (!parsedEmail.success) {
    console.error("Usage: bun run pin:reset <email-address>");
    console.error(parsedEmail.error.issues[0]?.message ?? "Invalid email address");
    process.exit(1);
  }

  const result = await resetPinByEmail(parsedEmail.data);

  console.log(`PIN reset completed for ${parsedEmail.data}.`);
  console.log(`Deleted ${result.sessionCount} active session(s).`);
  console.log(
    result.pinWasConfigured
      ? "The user must sign in and create a new PIN."
      : "No PIN was configured; the user must sign in and create one."
  );
}

main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "PIN reset failed";
    console.error(message);
    process.exit(1);
  });
