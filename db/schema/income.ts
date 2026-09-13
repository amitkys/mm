import { pgTable, text, timestamp, numeric, pgEnum, index } from "drizzle-orm/pg-core";
import { generateUniqueId, generateReadableName } from "@/lib/utils";
import { user } from "./user";

export const incomeTypeEnum = pgEnum("income_type", [
  "Income",
  "Transfer",
  "Reimbursement",
]);

export type IncomeType = (typeof incomeTypeEnum.enumValues)[number];

export const incomeSourceEnum = pgEnum("income_source", [
  "Salary",
  "Freelance/Business",
  "Friend Repayment",
  "Interest/Dividends",
  "Refund",
  "ATM Withdrawal",
  "Other",
]);

export type IncomeSource = (typeof incomeSourceEnum.enumValues)[number];

export const incomeDepositedToEnum = pgEnum("income_deposited_to", [
  "Cash",
  "Bank",
  "UPI",
  "Credit Card",
  "Other",
]);

export type IncomeDepositedTo = (typeof incomeDepositedToEnum.enumValues)[number];

export const income = pgTable(
  "income",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateUniqueId("inc")),

    // Human-readable identifier (e.g., "swift-fox-42", "brave-dolphin-87")
    name: text("name")
      .$defaultFn(() => generateReadableName())
      .notNull(),

    date: timestamp("date").notNull(),
    type: incomeTypeEnum("type").default("Income").notNull(),
    source: incomeSourceEnum("source").notNull(),
    description: text("description"),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    depositedTo: incomeDepositedToEnum("deposited_to").notNull(),
    notes: text("notes"),

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
    index("income_userId_idx").on(table.userId),
    index("income_name_idx").on(table.name),
    index("income_date_idx").on(table.date),
    index("income_type_idx").on(table.type),
    index("income_source_idx").on(table.source),
  ]
);
