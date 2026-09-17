---
name: react-hook-form
description: Patterns for React Hook Form with Zod validation and shadcn UI field primitives. Use when building or modifying forms, adding form fields, or working with Zod schemas.
---

# React Hook Form + Zod + shadcn UI

Use this pattern for typed, validated forms across projects. This section covers UI form composition only; server actions, database access, and API implementation are outside its scope.

## UI Primitives Installation & Customization

1. **Install official UI component via CLI** (do not write UI files from scratch manually):
   ```bash
   bunx --bun shadcn@latest add field
   ```

2. **Add `requiredLable` prop customization** on top of the generated `components/ui/field.tsx`:

```tsx
function FieldLabel({
  className,
  requiredLable,
  children,
  ...props
}: React.ComponentProps<typeof Label> & {
  requiredLable?: boolean;
}) {
  return (
    <Label
      data-slot="field-label"
      className={cn(
        "group/field-label peer/field-label flex w-fit gap-1.5 leading-snug group-data-[disabled=true]/field:opacity-50 has-data-checked:bg-input/30 has-[>[data-slot=field]]:rounded-2xl has-[>[data-slot=field]]:border has-[>[data-slot=field]]:not-has-[:disabled,[data-disabled]]:hover:bg-input/40 has-[>[data-slot=field]]:has-[:focus-visible]:border-ring has-[>[data-slot=field]]:has-[:focus-visible]:ring-3 has-[>[data-slot=field]]:has-[:focus-visible]:ring-ring/50 *:data-[slot=field]:p-4",
        "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col",
        className
      )}
      {...props}
    >
      <span>{children}</span>
      {requiredLable && <span className="form-required leading-none">*</span>}
    </Label>
  );
}
```

3. **Add companion CSS** in `globals.css`:

```css
/* For aligning the required asterisk properly */
.form-required {
  @apply text-destructive inline-block translate-y-[2px] transform text-[0.95em];
}
```

When `requiredLable` is true on `<FieldLabel requiredLable>`, it appends a red `*` asterisk automatically after the label text.

## Recommended form structure

Keep form components colocated inside the route's `_components/` directory. The depth depends on route complexity:

**Simple route** — form files live directly in `_components/`:

```text
app/<route>/
├── _components/
│   ├── main-form.tsx              ← form owner (useForm, Card, submit)
│   ├── <field-group>.tsx          ← grouped fields (e.g. contact-fields.tsx, identity-fields.tsx)
│   └── <helper>.ts               ← field-group-specific helpers
└── lib/
    ├── actions.ts                 ← server actions for this route
    └── zod-type/
        └── <form-name>.ts         ← Zod schema + inferred type
```

**Heavy route** — group by feature name inside `_components/` when the route has multiple forms or modules:

```text
app/<route>/
├── _components/
│   ├── <feature_name>/            ← e.g. personal_candidate/
│   │   ├── main.tsx               ← form owner (useForm, Card, submit)
│   │   ├── <field-group>.tsx      ← e.g. contact-fields.tsx, identity-fields.tsx
│   │   ├── <field-group>.tsx      ← split by logical section to keep files small
│   │   ├── <sub-component>.tsx    ← small UI pieces used by field groups
│   │   └── <helper>.ts           ← field-group-specific helpers (validation, upload, etc.)
│   └── <another_feature>/
│       └── ...
└── lib/
    ├── actions.ts
    └── zod-type/
        └── <form-name>.ts
```

## Zod schema (`lib/zod-type/<form-name>.ts`)

- Define the complete Zod schema.
- Export the schema **and** its inferred TypeScript type.
- Keep validation rules, required fields, enum values, and transformations in the schema.
- **Reuse Database Enums**: When an enum is already defined in the Drizzle table schema (e.g., `paymentMethodEnum` in `@/db/schema/export`), reuse it directly in the Zod schema via `z.enum(myEnum.enumValues)` instead of creating duplicate `z.enum([...])` arrays.
- **Zod v4 Error Property**: Use `{ error: "Your custom message" }` (e.g., `min(1, { error: "Name is required" })`, `z.date({ error: "Date is required" })`) instead of the legacy `{ message: "..." }`.
- Prefer names such as `addEntitySchema` (camelCase) and `AddEntitySchema` (PascalCase type).

```ts
import { z } from "zod";

export const addEntitySchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1, { error: "Name is required" }),
  email: z.string().trim().email({ error: "Valid email is required" }),
  // ...
});

export type AddEntitySchema = z.infer<
  typeof addEntitySchema
>;
```

---

## Main form component (`_components/<feature_name>/main.tsx`)

The main form file owns initialization and submission. Fields are split into child components (e.g. `contact-fields.tsx`, `identity-fields.tsx`) so that no single file grows endlessly as the form gains more fields.

Responsibilities:
- Mark the component with `"use client"` when it uses `useForm`, event handlers, or other client-only hooks.
- Initialize the form with `useForm<FormValues>()`.
- Connect the schema with `zodResolver(formSchema)`.
- Define complete `defaultValues` that match the form type.
- Own `form.handleSubmit(...)`, submission state, and the top-level `<form>` element.
- Wrap the form fields inside a shadcn `Card` (`CardHeader` → `CardTitle`, `CardContent` → fields grid, `CardFooter` → submit button).
- Use `LoadingSwap` inside the submit `Button` to show a spinner during `isPending`.
- Pass the **typed form instance** to child field-group components as a `form` prop.

```tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { LoadingSwap } from "@/components/ui/loading-swap";
import {
  type AddEntitySchema,
  addEntitySchema,
} from "../../lib/zod-type/<form-name>";
import { useAddEntity } from "../../query/mut-add-<entity>";
import { ContactFields } from "./contact-fields";
import { IdentityFields } from "./identity-fields";

export function AddEntityForm({
  entityId,
}: {
  entityId: string;
}) {
  const form = useForm<AddEntitySchema>({
    resolver: zodResolver(addEntitySchema),
    defaultValues: {
      id: entityId,
      name: "",
      email: "",
      // ... all fields with matching defaults
    },
  });

  const { mutateAsync: addEntity, isPending } =
    useAddEntity({ entityId });

  const onSubmit = (data: AddEntitySchema) => {
    addEntity(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Card>
        <CardHeader className="gap-2">
          <CardTitle className="max-w-none">
            <h4>Section Title</h4>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <ContactFields form={form} />
            <IdentityFields form={form} />
          </div>
        </CardContent>
        <CardFooter className="justify-center">
          <Button
            disabled={isPending}
            type="submit"
            size="lg"
            className="px-8 text-base"
          >
            <LoadingSwap isLoading={isPending}>
              Save Details
            </LoadingSwap>
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
```

---

## Passing `form` to child field-group components

Child field-group components receive the entire `form` object via a typed prop. Always type it with `UseFormReturn<FormValues>`. Name each child file after the logical group of fields it contains (e.g. `contact-fields.tsx`, `identity-fields.tsx`, `address-fields.tsx`):

```tsx
import { Controller, type UseFormReturn } from "react-hook-form";
import type { AddEntitySchema } from "../../lib/zod-type/<form-name>";

export function ContactFields({
  form,
}: {
  form: UseFormReturn<AddEntitySchema>;
}) {
  return (
    <>
      {/* Controller fields here */}
    </>
  );
}
```

Rules for child field-group components (`_components/<feature_name>/<field-group>.tsx`):
- Keep related fields together in route-level child components.
- Receive `form` through props using `UseFormReturn<FormValues>`.
- Use `Controller` for controlled shadcn inputs, selects, custom controls, and file inputs.
- Connect every controlled field to `form.control` and provide its exact field name.
- Render `fieldState.error` through the shadcn `FieldError` component.
- Set `aria-invalid={fieldState.invalid}` on the input or control.
- Keep field-specific display and interaction logic in the child component, while keeping form initialization in `main.tsx`.
- If a field group has complex sub-components (e.g. upload button, preview dialog), extract them into sibling files within the same feature folder.

---

## shadcn Field composition with Controller

Use the shadcn field primitives consistently inside every `Controller`:

**Simple text input:**

```tsx
<Controller
  control={form.control}
  name="name"
  render={({ field, fieldState }) => (
    <Field>
      <FieldLabel requiredLable>Name</FieldLabel>
      <FieldContent>
        <Input
          {...field}
          aria-invalid={fieldState.invalid}
          placeholder="Enter full name"
        />
        <FieldError errors={[fieldState.error]} />
      </FieldContent>
    </Field>
  )}
/>
```

**NativeSelect (enum field):**

```tsx
const statusOptions = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
] as const;

<Controller
  control={form.control}
  name="status"
  render={({ field, fieldState }) => (
    <Field>
      <FieldLabel requiredLable>Status</FieldLabel>
      <FieldContent>
        <NativeSelect
          {...field}
          aria-invalid={fieldState.invalid}
          className="w-full"
        >
          {statusOptions.map((option) => (
            <NativeSelectOption key={option.value} value={option.value}>
              {option.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <FieldError errors={[fieldState.error]} />
      </FieldContent>
    </Field>
  )}
/>
```

**File input with `data-invalid` and `FieldDescription`:**

```tsx
<Controller
  control={form.control}
  name="attachment"
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid || undefined}>
      <FieldLabel requiredLable>Upload File</FieldLabel>
      <FieldContent>
        {/* Custom file input with validation */}
        {!fieldState.error ? (
          <FieldDescription>Choose an image (max 50KB).</FieldDescription>
        ) : null}
        <FieldError errors={[fieldState.error]} />
      </FieldContent>
    </Field>
  )}
/>
```

Field composition rules:
- Use `Field`, `FieldLabel`, `FieldContent`, `FieldDescription`, and `FieldError` instead of creating one-off label and error markup.
- Use the appropriate shadcn control (`Input`, `Textarea`, `Select`, `NativeSelect`, `Checkbox`, `RadioGroup`, or a project-specific control).
- Do not duplicate validation messages in JSX when they already come from Zod.
- Use `field.onChange`, `field.onBlur`, `field.value`, `field.name`, and `field.ref` when integrating custom controls.
- For file inputs, validate the selected file in the field component, use `form.setError` and `form.clearErrors`, and update the form value only after the value is ready.
- Avoid `register` for complex controlled components. Use `register` only for simple native inputs when it fits the existing form pattern.
- Use `data-invalid={fieldState.invalid || undefined}` on the `Field` wrapper when the field needs parent-level invalid styling (common for file inputs and custom controls).
- Show `FieldDescription` conditionally: hide it when there is a `fieldState.error` to avoid visual clutter.

---

## Helper extraction pattern

When a field group has complex logic (file validation, uploads, constants), extract helpers into a sibling `.ts` file in the same feature folder:

```text
_components/<feature_name>/
├── <field-group>.tsx              ← uses the helpers
├── <feature>-helpers.ts           ← constants, validators, async operations
├── <feature>-action-button.tsx    ← small UI sub-component
└── <feature>-preview.tsx          ← small UI sub-component
```

Keep helpers focused:
- Export constants (`ACCEPTED_FILE_TYPES`, `MAX_FILE_SIZE`).
- Export pure validation functions (`isAcceptedFileType`, `isWithinSizeLimit`).
- Export async operations (`uploadFile`).
- Keep types co-located with the helper when they are only used there.
