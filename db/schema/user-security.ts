import { pgTable, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { generateUniqueId } from "@/lib/utils";
import { user } from "./user";

export const userSecurity = pgTable(
  "user_security",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateUniqueId("usr_sec")),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    pinHash: text("pin_hash").notNull(),
    failedAttempts: integer("failed_attempts").default(0).notNull(),
    lockedUntil: timestamp("locked_until"),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("user_security_userId_idx").on(table.userId),
  ]
);
