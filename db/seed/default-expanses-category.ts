import { eq, and, isNull } from "drizzle-orm";
import { db } from "../index";
import { expansesCategory } from "../schema/export";

export const DEFAULT_EXPANSES_CATEGORIES = [
  // Housing
  { category: "Housing", subCategory: "Rent / Mortgage (EMI)" },
  { category: "Housing", subCategory: "Property tax" },
  { category: "Housing", subCategory: "Home/renters insurance" },
  { category: "Housing", subCategory: "Maintenance & repairs" },
  { category: "Housing", subCategory: "Society/maintenance charges" },
  { category: "Housing", subCategory: "Furniture & furnishings" },
  { category: "Housing", subCategory: "Appliances (fridge, washing machine, AC, etc.)" },
  { category: "Housing", subCategory: "Renovation / interior work" },
  { category: "Housing", subCategory: "Pest control" },

  // Utilities
  { category: "Utilities", subCategory: "Electricity" },
  { category: "Utilities", subCategory: "Water" },
  { category: "Utilities", subCategory: "Gas (LPG/piped gas)" },
  { category: "Utilities", subCategory: "Internet / Broadband" },
  { category: "Utilities", subCategory: "Mobile/phone recharge & bills" },
  { category: "Utilities", subCategory: "DTH/Cable TV" },
  { category: "Utilities", subCategory: "Streaming subscriptions (Netflix, Prime, Spotify, etc.)" },
  { category: "Utilities", subCategory: "Cloud storage subscriptions" },
  { category: "Utilities", subCategory: "Landline" },

  // Food & Groceries
  { category: "Food & Groceries", subCategory: "Vegetables & Fruits (fresh, daily)" },
  { category: "Food & Groceries", subCategory: "Grains, Rice & Atta/Flour" },
  { category: "Food & Groceries", subCategory: "Pulses, Lentils & Beans" },
  { category: "Food & Groceries", subCategory: "Dairy (milk, curd, paneer, ghee)" },
  { category: "Food & Groceries", subCategory: "Meat, Fish & Eggs" },
  { category: "Food & Groceries", subCategory: "Cooking Oil, Ghee & Spices" },
  { category: "Food & Groceries", subCategory: "Bread & Bakery (basic)" },
  { category: "Food & Groceries", subCategory: "Dry Fruits & Nuts" },
  { category: "Food & Groceries", subCategory: "Bulk/Wholesale Staples purchase" },
  { category: "Food & Groceries", subCategory: "Dining out / Restaurants" },
  { category: "Food & Groceries", subCategory: "Food delivery (Swiggy/Zomato/UberEats)" },
  { category: "Food & Groceries", subCategory: "Tea/Coffee/Snacks" },
  { category: "Food & Groceries", subCategory: "Fast Food" },
  { category: "Food & Groceries", subCategory: "Sweets, Mithai & Desserts" },
  { category: "Food & Groceries", subCategory: "Cold Drinks & Soft Drinks" },
  { category: "Food & Groceries", subCategory: "Alcohol/Beverages" },
  { category: "Food & Groceries", subCategory: "Office/Work Lunch (bought outside)" },

  // Transportation
  { category: "Transportation", subCategory: "Fuel (petrol/diesel/CNG)" },
  { category: "Transportation", subCategory: "Public transport (bus, metro, train)" },
  { category: "Transportation", subCategory: "Cab/taxi (Ola/Uber)" },
  { category: "Transportation", subCategory: "Vehicle EMI/loan" },
  { category: "Transportation", subCategory: "Vehicle insurance" },
  { category: "Transportation", subCategory: "Vehicle maintenance & servicing" },
  { category: "Transportation", subCategory: "Parking fees" },
  { category: "Transportation", subCategory: "Tolls" },
  { category: "Transportation", subCategory: "Vehicle registration/RC renewal" },
  { category: "Transportation", subCategory: "Car/bike wash" },

  // Health & Medical
  { category: "Health & Medical", subCategory: "Doctor consultations" },
  { category: "Health & Medical", subCategory: "Medicines/pharmacy" },
  { category: "Health & Medical", subCategory: "Health insurance premium" },
  { category: "Health & Medical", subCategory: "Dental care" },
  { category: "Health & Medical", subCategory: "Eye care/glasses/contact lenses" },
  { category: "Health & Medical", subCategory: "Diagnostic tests/lab work" },
  { category: "Health & Medical", subCategory: "Hospitalization" },
  { category: "Health & Medical", subCategory: "Physiotherapy" },
  { category: "Health & Medical", subCategory: "Mental health/therapy/counseling" },
  { category: "Health & Medical", subCategory: "Vitamins & supplements" },
  { category: "Health & Medical", subCategory: "Medical equipment" },

  // Personal Care
  { category: "Personal Care", subCategory: "Haircuts/salon" },
  { category: "Personal Care", subCategory: "Spa/massage" },
  { category: "Personal Care", subCategory: "Skincare products" },
  { category: "Personal Care", subCategory: "Cosmetics/makeup" },
  { category: "Personal Care", subCategory: "Personal hygiene products" },
  { category: "Personal Care", subCategory: "Grooming (manicure, pedicure, etc.)" },
  { category: "Personal Care", subCategory: "Gym membership" },
  { category: "Personal Care", subCategory: "Yoga/fitness classes" },
  { category: "Personal Care", subCategory: "Sports equipment" },

  // Clothing & Accessories
  { category: "Clothing & Accessories", subCategory: "Everyday clothing" },
  { category: "Clothing & Accessories", subCategory: "Footwear" },
  { category: "Clothing & Accessories", subCategory: "Formal/office wear" },
  { category: "Clothing & Accessories", subCategory: "Seasonal wear (winter/monsoon)" },
  { category: "Clothing & Accessories", subCategory: "Accessories (bags, belts, jewelry, watches)" },
  { category: "Clothing & Accessories", subCategory: "Laundry/dry cleaning" },
  { category: "Clothing & Accessories", subCategory: "Tailoring/alterations" },

  // Education
  { category: "Education", subCategory: "School/college fees" },
  { category: "Education", subCategory: "Tuition/private coaching" },
  { category: "Education", subCategory: "Books & stationery" },
  { category: "Education", subCategory: "Online courses/certifications" },
  { category: "Education", subCategory: "Educational apps/software" },
  { category: "Education", subCategory: "Exam fees" },
  { category: "Education", subCategory: "School supplies (uniform, bag, etc.)" },
  { category: "Education", subCategory: "Student loan payments" },
  { category: "Education", subCategory: "Workshops/seminars" },

  // Children & Family
  { category: "Children & Family", subCategory: "Childcare/daycare" },
  { category: "Children & Family", subCategory: "Baby products (diapers, formula)" },
  { category: "Children & Family", subCategory: "Toys & games" },
  { category: "Children & Family", subCategory: "Kids' clothing" },
  { category: "Children & Family", subCategory: "School activities/field trips" },
  { category: "Children & Family", subCategory: "Allowance/pocket money" },
  { category: "Children & Family", subCategory: "Babysitting" },
  { category: "Children & Family", subCategory: "Family events (birthdays, etc.)" },

  // Insurance
  { category: "Insurance", subCategory: "Life insurance" },
  { category: "Insurance", subCategory: "Health insurance" },
  { category: "Insurance", subCategory: "Vehicle insurance" },
  { category: "Insurance", subCategory: "Home/property insurance" },
  { category: "Insurance", subCategory: "Term insurance" },
  { category: "Insurance", subCategory: "Travel insurance" },

  // Investments & Savings
  { category: "Investments & Savings", subCategory: "Mutual funds/SIP" },
  { category: "Investments & Savings", subCategory: "Stocks/equity" },
  { category: "Investments & Savings", subCategory: "Fixed deposits/RD" },
  { category: "Investments & Savings", subCategory: "PPF/EPF contributions" },
  { category: "Investments & Savings", subCategory: "Retirement funds" },
  { category: "Investments & Savings", subCategory: "Gold/silver investment" },
  { category: "Investments & Savings", subCategory: "Real estate investment" },
  { category: "Investments & Savings", subCategory: "Cryptocurrency" },
  { category: "Investments & Savings", subCategory: "Emergency fund contributions" },

  // Debt & Loans
  { category: "Debt & Loans", subCategory: "Credit card payments" },
  { category: "Debt & Loans", subCategory: "Personal loan EMI" },
  { category: "Debt & Loans", subCategory: "Home loan EMI" },
  { category: "Debt & Loans", subCategory: "Car loan EMI" },
  { category: "Debt & Loans", subCategory: "Education loan EMI" },
  { category: "Debt & Loans", subCategory: "Interest/late fees" },
  { category: "Debt & Loans", subCategory: "Loan against property" },

  // Entertainment & Leisure
  { category: "Entertainment & Leisure", subCategory: "Movies/theatre" },
  { category: "Entertainment & Leisure", subCategory: "Concerts/events" },
  { category: "Entertainment & Leisure", subCategory: "Gaming (consoles, in-app purchases)" },
  { category: "Entertainment & Leisure", subCategory: "Hobbies (art, music, crafts)" },
  { category: "Entertainment & Leisure", subCategory: "Books/magazines" },
  { category: "Entertainment & Leisure", subCategory: "Amusement parks" },
  { category: "Entertainment & Leisure", subCategory: "Sports events/tickets" },
  { category: "Entertainment & Leisure", subCategory: "Club memberships" },
  { category: "Entertainment & Leisure", subCategory: "Photography" },

  // Travel & Vacation
  { category: "Travel & Vacation", subCategory: "Flights" },
  { category: "Travel & Vacation", subCategory: "Hotels/accommodation" },
  { category: "Travel & Vacation", subCategory: "Local transport while traveling" },
  { category: "Travel & Vacation", subCategory: "Travel packages" },
  { category: "Travel & Vacation", subCategory: "Visa fees" },
  { category: "Travel & Vacation", subCategory: "Travel gear/luggage" },
  { category: "Travel & Vacation", subCategory: "Sightseeing/activities" },
  { category: "Travel & Vacation", subCategory: "Travel insurance" },
  { category: "Travel & Vacation", subCategory: "Foreign exchange charges" },

  // Gifts & Donations
  { category: "Gifts & Donations", subCategory: "Birthday/anniversary gifts" },
  { category: "Gifts & Donations", subCategory: "Wedding gifts" },
  { category: "Gifts & Donations", subCategory: "Festival gifts" },
  { category: "Gifts & Donations", subCategory: "Charity/donations" },
  { category: "Gifts & Donations", subCategory: "Religious donations" },
  { category: "Gifts & Donations", subCategory: "Crowdfunding contributions" },
  { category: "Gifts & Donations", subCategory: "Tips (waiters, delivery, etc.)" },

  // Pets
  { category: "Pets", subCategory: "Pet food" },
  { category: "Pets", subCategory: "Vet visits/vaccinations" },
  { category: "Pets", subCategory: "Grooming" },
  { category: "Pets", subCategory: "Pet insurance" },
  { category: "Pets", subCategory: "Pet toys/accessories" },
  { category: "Pets", subCategory: "Boarding/pet-sitting" },
  { category: "Pets", subCategory: "Pet training" },

  // Technology & Gadgets
  { category: "Technology & Gadgets", subCategory: "Mobile phones" },
  { category: "Technology & Gadgets", subCategory: "Laptops/computers" },
  { category: "Technology & Gadgets", subCategory: "Software/apps/licenses" },
  { category: "Technology & Gadgets", subCategory: "Gadget accessories (chargers, cases)" },
  { category: "Technology & Gadgets", subCategory: "Smart home devices" },
  { category: "Technology & Gadgets", subCategory: "Repairs (phone/laptop screen, etc.)" },
  { category: "Technology & Gadgets", subCategory: "Camera equipment" },

  // Taxes & Government Fees
  { category: "Taxes & Government Fees", subCategory: "Income tax" },
  { category: "Taxes & Government Fees", subCategory: "Property tax" },
  { category: "Taxes & Government Fees", subCategory: "Vehicle tax" },
  { category: "Taxes & Government Fees", subCategory: "Professional tax" },
  { category: "Taxes & Government Fees", subCategory: "License renewals (driving license, passport)" },
  { category: "Taxes & Government Fees", subCategory: "Legal fees/notary" },

  // Business/Work-Related
  { category: "Business/Work-Related", subCategory: "Office rent" },
  { category: "Business/Work-Related", subCategory: "Employee salaries" },
  { category: "Business/Work-Related", subCategory: "Software/tools subscriptions" },
  { category: "Business/Work-Related", subCategory: "Marketing/advertising" },
  { category: "Business/Work-Related", subCategory: "Business travel" },
  { category: "Business/Work-Related", subCategory: "Office supplies" },
  { category: "Business/Work-Related", subCategory: "Professional services (accountant, lawyer)" },
  { category: "Business/Work-Related", subCategory: "Business insurance" },

  // Miscellaneous
  { category: "Miscellaneous", subCategory: "Bank charges/fees" },
  { category: "Miscellaneous", subCategory: "ATM withdrawal fees" },
  { category: "Miscellaneous", subCategory: "Late payment penalties" },
  { category: "Miscellaneous", subCategory: "Subscriptions (unclassified)" },
  { category: "Miscellaneous", subCategory: "Lost item replacement" },
  { category: "Miscellaneous", subCategory: "Emergency/unexpected expenses" },
  { category: "Miscellaneous", subCategory: "Storage/warehouse rental" },
  { category: "Miscellaneous", subCategory: "Courier/shipping charges" },
  { category: "Miscellaneous", subCategory: "Printing/photocopying" },

  // Festivals & Celebrations
  { category: "Festivals & Celebrations", subCategory: "Festival shopping (clothes, sweets, decorations)" },
  { category: "Festivals & Celebrations", subCategory: "Puja/religious ceremony expenses" },
  { category: "Festivals & Celebrations", subCategory: "Wedding expenses" },
  { category: "Festivals & Celebrations", subCategory: "Party hosting costs" },
  { category: "Festivals & Celebrations", subCategory: "Fireworks" },

  // Self-Improvement
  { category: "Self-Improvement", subCategory: "Books (non-academic)" },
  { category: "Self-Improvement", subCategory: "Online subscriptions (Audible, Coursera, etc.)" },
  { category: "Self-Improvement", subCategory: "Coaching/mentorship" },
  { category: "Self-Improvement", subCategory: "Meditation apps" },
  { category: "Self-Improvement", subCategory: "Life coaching" },
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
