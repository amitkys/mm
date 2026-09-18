import "dotenv/config";
import { db } from "../db";
import { user, userSecurity } from "../db/schema/export";
import { eq } from "drizzle-orm";

async function main() {
  const args = process.argv.slice(2);
  const targetEmailOrId = args[0]?.trim();

  console.log("\n🔑 --- Admin PIN Reset Tool ---\n");

  if (!targetEmailOrId) {
    console.log("Usage: bun run pin:reset <user_email_or_id>\n");
    console.log("Fetching registered users and PIN status...\n");

    const users = await db.select().from(user);
    const securities = await db.select().from(userSecurity);
    const securityMap = new Map(securities.map((s) => [s.userId, s]));

    if (users.length === 0) {
      console.log("No users found in database.");
      process.exit(0);
    }

    console.table(
      users.map((u) => ({
        ID: u.id,
        Name: u.name,
        Email: u.email,
        "Has PIN": securityMap.has(u.id) ? "YES" : "NO",
        "Failed Attempts": securityMap.get(u.id)?.failedAttempts ?? 0,
        "Is Locked":
          securityMap.get(u.id)?.lockedUntil &&
          securityMap.get(u.id)!.lockedUntil! > new Date()
            ? "YES"
            : "NO",
      }))
    );

    console.log(
      "\nTo reset a user's PIN, run:\n  bun run pin:reset <email>\n"
    );
    process.exit(0);
  }

  // Find user by email or ID
  const [foundUser] = await db
    .select()
    .from(user)
    .where(
      targetEmailOrId.includes("@")
        ? eq(user.email, targetEmailOrId)
        : eq(user.id, targetEmailOrId)
    );

  if (!foundUser) {
    console.error(`❌ User not found with email or ID: "${targetEmailOrId}"`);
    process.exit(1);
  }

  // Check existing security entry
  const [secRecord] = await db
    .select()
    .from(userSecurity)
    .where(eq(userSecurity.userId, foundUser.id));

  if (!secRecord) {
    console.log(
      `ℹ️ User "${foundUser.name}" (${foundUser.email}) does not have a PIN set up.`
    );
    process.exit(0);
  }

  // Delete PIN record
  await db.delete(userSecurity).where(eq(userSecurity.userId, foundUser.id));

  console.log(
    `✅ Successfully reset PIN for "${foundUser.name}" (${foundUser.email}).`
  );
  console.log(
    `👉 User will be automatically redirected to /setup-pin on their next login.\n`
  );

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Failed to reset PIN:", err);
  process.exit(1);
});
