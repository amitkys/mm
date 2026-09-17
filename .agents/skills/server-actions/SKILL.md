---
name: server-actions
description: Patterns for server actions, TanStack Query hooks, and data fetching. Use when creating or modifying server actions, query hooks, or mutation hooks.
---

# Server Action and Data Fetching

- One `lib/action.ts` per route — do not split into multiple action files.
- Each file in `query/` maps 1:1 to one action in `lib/action.ts`.

## Naming convention

Same operation, three layers, three distinct names — suffix identifies the layer:

| Layer | File | Suffix | Example |
|---|---|---|---|
| Server action | `lib/action.ts` | `...Action` | `getPlatformAction` |
| Query options factory (reads only) | `query/get.ts` | `...Query` | `getPlatformQuery` |
| Query hook (reads only) | `query/get.ts` | `use...Query` | `useGetPlatformQuery` |
| Mutation hook (writes) | `query/create.ts`, `update.ts`, `delete.ts` | `use...Mutation` | `useCreatePlatformMutation` |

Rule: only the function calling `useQuery`/`useMutation` gets the `use` prefix. Never reuse the same name across layers.

## Server action rules

- Every server action body is wrapped in `try/catch`.
- **Server-Side Zod Validation**: If a form uses a Zod schema on the client side, the server action **must validate incoming input with the same Zod schema** (`schema.safeParse(input)`) before executing any database or business logic. No operations should take place until validation passes. If validation fails, return `{ success: false, message: "Invalid input data" }` (or detailed field errors).
- **Never** annotate the function's return type (no `Promise<ActionResponse<T>>`). Let TypeScript infer it from the actual `db` query result (Drizzle) so schema changes propagate automatically.
- Return shape:
  - Success → `{ success: true, data }` — **no `message` on success.**
  - Failure → `{ success: false, message }` — generic, user-safe message. Never leak the raw error to the client.
- In the `catch` block: `console.error("<actionName> error", error)` — always the action's own name, always `console.error` (not `console.log`), so logs are filterable and traceable.

```ts
// app/home/lib/action.ts
"use server";

export async function getPlatformAction() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, message: "User not authenticated" };

    const platform = await db
      .select()
      .from(platformTable)
      .where(eq(platformTable.userId, session.user.id));

    return { success: true, data: platform };
  } catch (error) {
    console.error("getPlatformAction error", error);
    return { success: false, message: "Failed to fetch platform" };
  }
}

export async function createPlatformAction(input: CreatePlatformSchema) {
  try {
    const parsed = createPlatformSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, message: "Invalid input data" };
    }

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, message: "User not authenticated" };

    const [platform] = await db
      .insert(platformTable)
      .values({ ...parsed.data, userId: session.user.id })
      .returning();

    return { success: true, data: platform };
  } catch (error) {
    console.error("createPlatformAction error", error);
    return { success: false, message: "Failed to create platform" };
  }
}

export async function updatePlatformAction(id: string, input: Partial<typeof platformTable.$inferInsert>) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, message: "User not authenticated" };

    const [platform] = await db
      .update(platformTable)
      .set(input)
      .where(eq(platformTable.id, id))
      .returning();

    return { success: true, data: platform };
  } catch (error) {
    console.error("updatePlatformAction error", error);
    return { success: false, message: "Failed to update platform" };
  }
}

export async function deletePlatformAction(id: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { success: false, message: "User not authenticated" };

    const [platform] = await db
      .delete(platformTable)
      .where(eq(platformTable.id, id))
      .returning();

    return { success: true, data: platform };
  } catch (error) {
    console.error("deletePlatformAction error", error);
    return { success: false, message: "Failed to delete platform" };
  }
}
```

## Read hooks (`query/get.ts`)

`queryFn` unwraps `{ success, ... }` and throws on failure — this hands TanStack's own `isError`/`error` state the job, instead of reinventing it.

```ts
// app/home/query/get.ts
import { queryOptions, useQuery } from "@tanstack/react-query";
import { getPlatformAction } from "@/app/home/lib/action";

export function getPlatformQuery() {
  return queryOptions({
    queryKey: ["get-platform"],
    queryFn: async () => {
      const res = await getPlatformAction();
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });
}

export function useGetPlatformQuery() {
  return useQuery(getPlatformQuery());
}

// Always export inferred entity types directly from read hooks in query/get.ts
export type Platform = NonNullable<ReturnType<typeof useGetPlatformQuery>["data"]>[number];
```

## Write hooks (`query/create.ts`, `update.ts`, `delete.ts`)

Mutations do **not** throw on failure — `res.success` stays available in `onSuccess` so the UI can branch (toast vs. proceed) without a try/catch at the call site.

```ts
// app/home/query/create.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPlatformAction } from "@/app/home/lib/action";

export function useCreatePlatformMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPlatformAction,
    onSuccess: (res) => {
      if (!res.success) return; // res.message -> toast
      queryClient.invalidateQueries({ queryKey: ["get-platform"] });
    },
  });
}
```

`update.ts` and `delete.ts` follow the identical shape — swap the imported action, the exported hook name (`useUpdatePlatformMutation`, `useDeletePlatformMutation`), and the invalidated `queryKey`.

## Checklist for every new action + query pair

- [ ] Action lives in the route's single `lib/action.ts`
- [ ] Action wrapped in `try/catch`, no return-type annotation
- [ ] Server-side Zod validation performed (`schema.safeParse(input)`) before executing database or business logic
- [ ] `console.error("<actionName> error", error)` in catch
- [ ] Success → `{ success: true, data }` only
- [ ] Failure → `{ success: false, message }` only, generic message
- [ ] Matching file in `query/` named after the verb (`get.ts`/`create.ts`/`update.ts`/`delete.ts`)
- [ ] Names follow `<verb><Entity>Action` / `<verb><Entity>Query` / `use<Verb><Entity>Query|Mutation`
- [ ] Entity types inferred and exported directly from `query/get.ts` (`export type Entity = NonNullable<ReturnType<typeof use...Query>["data"]>[number]`)
