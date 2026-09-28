// @ts-expect-error Bun test types are not part of the Next.js tsconfig.
import { test } from "bun:test";
import assert from "node:assert/strict";
import { groupPrintExpensesByCategory } from "./print-category-groups";

test("groups filtered expenses by category with share of their report total", () => {
  const groceryOne = { id: "a", category: "Grocery", amount: "10.10" };
  const groceryTwo = { id: "b", category: "Grocery", amount: "19.90" };
  const travel = { id: "c", category: "Travel", amount: "70.00" };
  const groups = groupPrintExpensesByCategory([groceryOne, travel, groceryTwo]);

  assert.deepEqual(groups.map(({ category, amount, percentage }) => ({ category, amount, percentage })), [
    { category: "Travel", amount: 70, percentage: 70 },
    { category: "Grocery", amount: 30, percentage: 30 },
  ]);
  assert.deepEqual(groups[1].logs.map((log) => log.id), ["a", "b"]);
});

test("an empty report has no category groups", () => {
  assert.deepEqual(groupPrintExpensesByCategory([]), []);
});
