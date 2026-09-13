import { pgTable, text, timestamp, numeric, pgEnum, index } from "drizzle-orm/pg-core";
import { generateUniqueId } from "@/lib/utils";
import { user } from "./user";
import { expansesCategory } from "./expanses-category";
import { income, incomeSourceEnum } from "./income";

export const paymentMethodEnum = pgEnum("payment_method", [
  "CASH",
  "DEBIT CARD",
  "CREDIT CARD",
  "UPI",
  "NET BANKING",
  "OTHER",
]);

export type PaymentMethod = (typeof paymentMethodEnum.enumValues)[number];

export const expansesTypeEnum = pgEnum("expanses_type", [
  "NEED",
  "WANT",
  "INVESTMENT",
]);

export type ExpansesType = (typeof expansesTypeEnum.enumValues)[number];

export const expansesLog = pgTable(
  "expanses_log",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateUniqueId("exp_log")),

    // Reference to income entry (ID & human readable name tag)
    incomeId: text("income_id").references(() => income.id, {
      onDelete: "set null",
    }),
    name: text("name"), // Referenced from income table (e.g. "brave-dolphin-42")

    date: timestamp("date").notNull(),

    // References to expanses_category table
    categoryId: text("category_id").references(() => expansesCategory.id, {
      onDelete: "set null",
    }),
    category: text("category").notNull(),
    subCategory: text("sub_category"),

    description: text("description"),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),

    // Enum columns
    paymentMethod: paymentMethodEnum("payment_method").notNull(),
    source: incomeSourceEnum("source"),
    type: expansesTypeEnum("type").notNull(),

    // User ownership
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("expanses_log_userId_idx").on(table.userId),
    index("expanses_log_incomeId_idx").on(table.incomeId),
    index("expanses_log_name_idx").on(table.name),
    index("expanses_log_date_idx").on(table.date),
    index("expanses_log_category_idx").on(table.category),
    index("expanses_log_type_idx").on(table.type),
  ]
);
