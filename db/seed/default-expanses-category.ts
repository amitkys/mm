import { eq, and, isNull } from "drizzle-orm";
import { db } from "../index";
import { expansesCategory } from "../schema/export";

export const DEFAULT_EXPANSES_CATEGORIES = [
  // Food & Dining
  { category: "Food & Dining", subCategory: "Groceries" },
  { category: "Food & Dining", subCategory: "Restaurants & Dining Out" },
  { category: "Food & Dining", subCategory: "Fast Food" },
  { category: "Food & Dining", subCategory: "Coffee & Cafe" },
  { category: "Food & Dining", subCategory: "Snacks & Beverages" },

  // Transportation
  { category: "Transportation", subCategory: "Fuel & Petrol" },
  { category: "Transportation", subCategory: "Public Transit" },
  { category: "Transportation", subCategory: "Taxi & Rideshare" },
  { category: "Transportation", subCategory: "Vehicle Maintenance" },
  { category: "Transportation", subCategory: "Parking & Tolls" },

  // Housing & Utilities
  { category: "Housing & Utilities", subCategory: "Rent & Mortgage" },
  { category: "Housing & Utilities", subCategory: "Electricity Bill" },
  { category: "Housing & Utilities", subCategory: "Water Bill" },
  { category: "Housing & Utilities", subCategory: "Gas Bill" },
  { category: "Housing & Utilities", subCategory: "Internet & Broadband" },
  { category: "Housing & Utilities", subCategory: "Home Repairs" },

  // Shopping & Personal Care
  { category: "Shopping & Personal Care", subCategory: "Clothing & Apparel" },
  { category: "Shopping & Personal Care", subCategory: "Electronics & Gadgets" },
  { category: "Shopping & Personal Care", subCategory: "Personal Hygiene" },
  { category: "Shopping & Personal Care", subCategory: "Home & Kitchen" },

  // Entertainment & Leisure
  { category: "Entertainment & Leisure", subCategory: "Movies & Shows" },
  { category: "Entertainment & Leisure", subCategory: "Streaming Subscriptions" },
  { category: "Entertainment & Leisure", subCategory: "Gaming & Hobbies" },
  { category: "Entertainment & Leisure", subCategory: "Travel & Vacation" },

  // Health & Medical
  { category: "Health & Medical", subCategory: "Medicines & Pharmacy" },
  { category: "Health & Medical", subCategory: "Doctor & Hospital" },
  { category: "Health & Medical", subCategory: "Health Insurance" },
  { category: "Health & Medical", subCategory: "Fitness & Gym" },

  // Financial & Bills
  { category: "Financial & Bills", subCategory: "Credit Card Bill" },
  { category: "Financial & Bills", subCategory: "Loans & EMI" },
  { category: "Financial & Bills", subCategory: "Taxes" },

  // Education & Career
  { category: "Education & Career", subCategory: "Tuition & Fees" },
  { category: "Education & Career", subCategory: "Books & Courses" },

  // Others
  { category: "Miscellaneous", subCategory: "Gifts & Donations" },
  { category: "Miscellaneous", subCategory: "General Expenses" },
];

export async function seedDefaultExpansesCategories() {
  console.log("Seeding default expense categories...");

  // Fetch existing default categories to prevent duplicates when run multiple times
  const existingDefaults = await db
    .select({
      category: expansesCategory.category,
      subCategory: expansesCategory.subCategory,
    })
    .from(expansesCategory)
    .where(
      and(
        eq(expansesCategory.isDefault, true),
        isNull(expansesCategory.userId)
      )
    );

  const existingKeys = new Set(
    existingDefaults.map(
      (row) =>
        `${row.category.trim().toLowerCase()}|${(row.subCategory || "").trim().toLowerCase()}`
    )
  );

  const newCategoriesToInsert = DEFAULT_EXPANSES_CATEGORIES.filter(
    (item) =>
      !existingKeys.has(
        `${item.category.trim().toLowerCase()}|${(item.subCategory || "").trim().toLowerCase()}`
      )
  );

  if (newCategoriesToInsert.length === 0) {
    console.log("All default expense categories already exist in database. Skipping insert.");
    return;
  }

  await db.insert(expansesCategory).values(
    newCategoriesToInsert.map((item) => ({
      ...item,
      isDefault: true,
      userId: null,
    }))
  );

  console.log(`Successfully seeded ${newCategoriesToInsert.length} new default expense category records.`);
}

// Allow running directly via CLI
if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes("default-expanses-category")) {
  seedDefaultExpansesCategories()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Failed to seed default expense categories:", err);
      process.exit(1);
    });
}
