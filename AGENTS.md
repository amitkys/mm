# Project Architecture & Context

## Expenses Category Architecture

The expenses category system manages both global default categories/sub-categories and user-specific customizations (custom categories, updates, or deletions).

### Schema & Files
- **Schema Definition**: [`db/schema/expanses-category.ts`](file:///home/amitkys/projects/amitkys/mm/db/schema/expanses-category.ts) (`expanses_category` table)
- **Central Schema Export**: [`db/schema/export.ts`](file:///home/amitkys/projects/amitkys/mm/db/schema/export.ts)
- **Central Drizzle Relations**: [`db/relations.ts`](file:///home/amitkys/projects/amitkys/mm/db/relations.ts) (uses `defineRelations` syntax)
- **Seeding Script**: [`db/seed/default-expanses-category.ts`](file:///home/amitkys/projects/amitkys/mm/db/seed/default-expanses-category.ts)

---

### Global vs. User-Level Architecture

```
                      +------------------------------------------+
                      |         expanses_category Table          |
                      +------------------------------------------+
                                           |
                   +-----------------------+-----------------------+
                   |                                               |
        [ Global Defaults ]                             [ User-Level Categories ]
        - userId: NULL                                  - userId: "usr_123"
        - isDefault: true                               - isDefault: false (or true if cloned)
        - Shared template for all users                 - Isolated copy owned by User 123
        - Immutable by end-users                        - User can Edit/Delete/Add freely
```

#### 1. Global Defaults (`userId = NULL`, `isDefault = true`)
- System default categories & sub-categories seeded via `db/seed/default-expanses-category.ts`.
- Available as a master baseline for all users across the system.
- **Global rows are NEVER modified or deleted by end-user actions**, ensuring other users and new signups are not affected.

#### 2. User-Level Customization (`userId = <user_id>`)
- Every user-specific category has `userId` bound to `user.id`.
- **Adding a Category**: Insert a new record with `userId = currentUser.id` and `isDefault = false`.
- **Modifying/Customizing a Default Category (Copy-on-Write / User Copy)**:
  - When a user modifies a default category or when default categories are seeded/cloned for a user upon onboarding, a user-specific row (`userId = currentUser.id`) is mutated or created.
  - Updating a user row only executes `UPDATE expanses_category SET category = ... WHERE userId = currentUser.id AND id = ...`.
- **Deleting a Category**:
  - Deleting a category executes `DELETE FROM expanses_category WHERE id = ... AND userId = currentUser.id`.
  - The deletion is scoped strictly to the active user's `userId`.

#### 3. Impact on Global Defaults
- **Zero Side Effects**: Global rows (`userId = NULL`) remain 100% untouched.
- **Multi-Tenant Isolation**: User A changing "Food & Dining" -> "Food & Groceries" or deleting "Fast Food" only changes User A's row. User B and future users continue to have their clean default values.

---

### Data Structure (`expanses_category`)
- `id`: Text primary key auto-generated via `$defaultFn(() => generateUniqueId("exp_cat"))` from [`lib/utils.ts`](file:///home/amitkys/projects/amitkys/mm/lib/utils.ts).
- `category`: Text column (e.g., `"Food & Dining"`).
- `subCategory`: Text column (nullable, e.g., `"Groceries"`).
- `userId`: Nullable text column referencing `user.id` (`onDelete: "cascade"`).
  - `userId = NULL`: Global system default category available for all users.
  - `userId = <user_id>`: User-specific category (user-added or user-owned clone).
- `isDefault`: Boolean flag (`true` for system-seeded default categories).
- `createdAt` & `updatedAt`: Timestamps with auto-default and update triggers.

### Seeding & Idempotency
- Seed script is located at [`db/seed/default-expanses-category.ts`](file:///home/amitkys/projects/amitkys/mm/db/seed/default-expanses-category.ts).
- The seed script accepts flat `{ category, subCategory }` objects in `DEFAULT_EXPANSES_CATEGORIES`.
- `seedDefaultExpansesCategories()` automatically attaches `isDefault: true` and `userId: null`.
- **Idempotency**: The seed function queries existing system defaults before inserting. Running `bun run db/seed/default-expanses-category.ts` multiple times is safe and will not duplicate entries.

### Key Commands
- **Push Database Schema**: `bun run db:push`
- **Run Category Seed**: `bun run db:stop` / `bun run db/seed/default-expanses-category.ts`
- **Launch Drizzle Studio**: `bun run db:studio`

---

# Customizations & Rule System

Detailed guidelines and workflow patterns are modularized in `.agents/`:

- **Coding Rules**: [`.agents/rules/code-quality.md`](file:///home/kys/projects/mm/.agents/rules/code-quality.md) (Readability, KISS, package management, git standards)
- **Server Actions & Data Fetching**: [`.agents/skills/server-actions/SKILL.md`](file:///home/kys/projects/mm/.agents/skills/server-actions/SKILL.md)
- **TanStack Data Table Architecture**: [`.agents/skills/data-table/SKILL.md`](file:///home/kys/projects/mm/.agents/skills/data-table/SKILL.md)
- **Loading Spinner Architecture**: [`.agents/skills/spinner/SKILL.md`](file:///home/kys/projects/mm/.agents/skills/spinner/SKILL.md)
- **Zustand State Management**: [`.agents/skills/zustand/SKILL.md`](file:///home/kys/projects/mm/.agents/skills/zustand/SKILL.md)
- **React Hook Form + Zod + shadcn**: [`.agents/skills/react-hook-form/SKILL.md`](file:///home/kys/projects/mm/.agents/skills/react-hook-form/SKILL.md)
