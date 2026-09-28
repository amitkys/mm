"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useCreatePinMutation } from "@/app/setup-pin/query/create";
import {
  createPinSchema,
  type CreatePinSchema,
} from "@/app/setup-pin/lib/zod-type/pin";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { PinInput } from "@/components/security/pin-input";

export function SetupPinForm() {
  const form = useForm<CreatePinSchema>({
    resolver: zodResolver(createPinSchema),
    defaultValues: { pin: "", confirmPin: "" },
  });
  const createPinMutation = useCreatePinMutation();

  const onSubmit = async (values: CreatePinSchema) => {
    form.clearErrors("root");
    const result = await createPinMutation.mutateAsync(values);

    if (!result.success) {
      form.setError("root", { message: result.message });
      return;
    }

    window.location.href = "/expanses-log";
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-md">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Create security PIN</CardTitle>
          <CardDescription>
            Use six digits to protect your financial data on this device.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Controller
              control={form.control}
              name="pin"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel requiredLable>New PIN</FieldLabel>
                  <FieldContent>
                    <PinInput
                      {...field}
                      invalid={fieldState.invalid}
                      disabled={createPinMutation.isPending}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="confirmPin"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel requiredLable>Confirm PIN</FieldLabel>
                  <FieldContent>
                    <PinInput
                      {...field}
                      invalid={fieldState.invalid}
                      disabled={createPinMutation.isPending}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />
            <FieldError errors={[form.formState.errors.root]} />
          </FieldGroup>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={createPinMutation.isPending}
          >
            <LoadingSwap isLoading={createPinMutation.isPending}>
              Create PIN
            </LoadingSwap>
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
