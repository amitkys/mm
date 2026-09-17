---
name: spinner
description: Loading spinner component usage rules, size variants, and standard patterns per context. Use when adding loading states, spinners, or creating loading.tsx files.
---

# Loading Spinner Architecture & Standard Usage Rules

## Component Source & Architecture
- **Central Spinner Component**: [`components/ui/spinner.tsx`](file:///home/kys/projects/mm/components/ui/spinner.tsx)
- **Underlying SVG Animation**: [`components/loading-ui/swirling.tsx`](file:///home/kys/projects/mm/components/loading-ui/swirling.tsx)
- **Rule**: Always import and use `Spinner` from `@/components/ui/spinner` across the entire application. **Do not use raw Lucide `Loader2`, `Loader`, or custom SVG loading icons**.

## Standard Size Variants (`size` prop)
`Spinner` uses `cva` (`class-variance-authority`) to provide standard, visually balanced size variants:

| Variant | Size Class | Value | Recommended Usage Context |
|---|---|---|---|
| `xs` | `size-6` | 24px | Micro row-action icon buttons (e.g., table action delete buttons) |
| `sm` | `size-7` | 28px | Small inline buttons, compact inputs |
| `default` | `size-8` | 32px | Standard form submit buttons, primary CTA loading states |
| `md` | `size-10` | 40px | Section loading blocks, card loading fallbacks, `LoadingSwap` |
| `lg` | `size-12` | 48px | Modals, dialogs, sheet content loading overlays |
| `xl` | `size-14` | 56px | Sub-route loading suspense boundaries |
| `2xl` | `size-20` | 80px | Route-level `loading.tsx` pages & full viewport overlays |

## Usage Rules per Context

1. **Route-Level `loading.tsx` Pages**:
   - Every route directory under `app/` MUST have a `loading.tsx` file.
   - Standard template for `loading.tsx`:
     ```tsx
     import { Spinner } from "@/components/ui/spinner";

     export default function Loading() {
       return (
         <div className="flex min-h-[50vh] w-full flex-1 items-center justify-center p-8">
           <Spinner size="2xl" />
         </div>
       );
     }
     ```

2. **Buttons & Form Submissions**:
   - Standard form buttons use `size="default"` or `size="sm"`.
   - Small icon action buttons (e.g. table row delete) use `size="xs"`.
   - Example:
     ```tsx
     <Button type="submit" disabled={isPending}>
       {isPending && <Spinner size="sm" className="mr-2" />}
       Save Changes
     </Button>
     ```

3. **Data Table & Section Loading**:
   - Table view loading blocks use `size="md"` centered inside a rounded border container.
   - Example:
     ```tsx
     if (isLoading) {
       return (
         <div className="flex h-48 items-center justify-center rounded-md border">
           <div className="flex items-center gap-2 text-muted-foreground">
             <Spinner size="md" />
             <span>Loading expense logs...</span>
           </div>
         </div>
       );
     }
     ```

4. **Custom Overrides**:
   - When specific pixel precision is required, pass custom Tailwind sizing via `className` (e.g., `<Spinner className="size-16" />`).
