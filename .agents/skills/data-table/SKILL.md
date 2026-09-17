---
name: data-table
description: TanStack Data Table architecture, folder structure, column definitions, and UI patterns. Use when building or modifying data tables with TanStack Table.
---

# TanStack Data Table Architecture & UI Patterns

## Route Folder Structure with Data Table

Every table-based route follows a consistent, modular folder structure:

```
apps/
└── [feature]/
    ├── page.tsx                    # Route page component
    ├── column.tsx                  # Table column definitions using createColumnHelper
    ├── data-table.tsx              # Reusable React Table UI wrapper
    ├── data-table-feature.tsx      # Registered table features (tree-shaking)
    ├── _components/                # Feature-scoped UI sub-components
    │   ├── [feature]-table-view.tsx  # Client container (Query hook + Header + DataTable)
    │   ├── add-[feature]-sheet.tsx   # Sheet/Form for adding records
    │   └── [feature]-row-actions.tsx # Row actions (Edit Sheet, Delete action)
    ├── lib/
    │   └── action.ts               # Route server actions (get, create, update, delete)
    └── query/
        ├── get.ts                  # Query options factory, useGet...Query, & entity type export
        ├── create.ts               # useCreate...Mutation hook
        ├── update.ts               # useUpdate...Mutation hook
        └── delete.ts               # useDelete...Mutation hook
```

## Key Data Table Implementation Rules

1. **Tree-Shaken Feature Registration (`data-table-feature.tsx`)**:
   - Register only required table features via `tableFeatures({...})` for tree-shaking.
   - Export `DataTableFeatures = typeof features` and pass it as the first generic argument to `createColumnHelper<DataTableFeatures, EntityType>()`.

2. **Type-Safe Column Definitions (`column.tsx`)**:
   - Import entity types directly from read hooks: `import { type Entity } from "./query/get"`.
   - Use `createColumnHelper<DataTableFeatures, Entity>()` to build columns.
   - Always place the **Actions** column at the very last position in the columns array.

3. **Client View Container (`_components/[feature]-table-view.tsx`)**:
   - Manages top-level client rendering, combining:
     - Data fetching hook (`useGet[Feature]Query()`).
     - Header layout with title/description on the left and `Add[Feature]Sheet` button on the top-right.
     - Loading spinners, error state callouts, and `<DataTable columns={columns} data={data ?? []} />`.

4. **Responsive Form Sheets (`add-[feature]-sheet.tsx`, `[feature]-row-actions.tsx`)**:
   - Use shadcn / Base UI `Sheet` components for Add and Edit forms.
   - Dynamically compute `side={isMobile ? "bottom" : "right"}` using `useIsMobile()` hook:
     - Mobile screens (< 640px): Sheet slides up from the **bottom**.
     - Desktop screens (>= 640px): Sheet slides out from the **right**.
   - Use core UI design tokens (`Input`, `Label`, `Button`, styled `<select>`).

5. **Mutations & Table Reactivity**:
   - Write hooks (`useCreate...Mutation`, `useUpdate...Mutation`, `useDelete...Mutation`) invalidate the queryKey on success (`if (!res.success) return; queryClient.invalidateQueries({ queryKey: [...] });`).
   - Ensures the data table updates automatically across client state without page reloads.
