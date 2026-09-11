import { pgTable, text, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { generateUniqueId } from "@/lib/utils";
import { user } from "./user";

export const expansesCategory = pgTable(
  "expanses_category",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateUniqueId("exp_cat")),
    category: text("category").notNull(),
    subCategory: text("sub_category"),

    // User ownership: NULL = system default template, non-null = user-owned
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),

    // Flag tracking system default rows
    isDefault: boolean("is_default").default(false).notNull(),

    createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("expanses_category_userId_idx").on(table.userId),
    index("expanses_category_category_idx").on(table.category),
  ]
);
