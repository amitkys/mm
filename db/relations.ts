import { defineRelations } from "drizzle-orm";
import * as schema from "./schema/export";

export const relations = defineRelations(schema, (r) => ({
  user: {
    sessions: r.many.session({
      from: r.user.id,
      to: r.session.userId,
    }),
    accounts: r.many.account({
      from: r.user.id,
      to: r.account.userId,
    }),
    expansesCategories: r.many.expansesCategory({
      from: r.user.id,
      to: r.expansesCategory.userId,
    }),
    incomes: r.many.income({
      from: r.user.id,
      to: r.income.userId,
    }),
    expansesLogs: r.many.expansesLog({
      from: r.user.id,
      to: r.expansesLog.userId,
    }),
  },
  session: {
    user: r.one.user({
      from: r.session.userId,
      to: r.user.id,
    }),
  },
  account: {
    user: r.one.user({
      from: r.account.userId,
      to: r.user.id,
    }),
  },
  expansesCategory: {
    user: r.one.user({
      from: r.expansesCategory.userId,
      to: r.user.id,
    }),
    expansesLogs: r.many.expansesLog({
      from: r.expansesCategory.id,
      to: r.expansesLog.categoryId,
    }),
  },
  income: {
    user: r.one.user({
      from: r.income.userId,
      to: r.user.id,
    }),
    expansesLogs: r.many.expansesLog({
      from: r.income.id,
      to: r.expansesLog.incomeId,
    }),
  },
  expansesLog: {
    user: r.one.user({
      from: r.expansesLog.userId,
      to: r.user.id,
    }),
    categoryRef: r.one.expansesCategory({
      from: r.expansesLog.categoryId,
      to: r.expansesCategory.id,
    }),
    incomeRef: r.one.income({
      from: r.expansesLog.incomeId,
      to: r.income.id,
    }),
  },
}));
