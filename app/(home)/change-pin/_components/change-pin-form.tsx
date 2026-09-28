"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  changePinSchema,
  type ChangePinSchema,
} from "@/app/setup-pin/lib/zod-type/pin";
import { useChangePinMutation } from "@/app/(home)/change-pin/query/update";
import { PinInput } from "@/components/security/pin-input";
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

export function ChangePinForm() {
  const changePinMutation = useChangePinMutation();
  const form = useForm<ChangePinSchema>({
    resolver: zodResolver(changePinSchema),
    defaultValues: { currentPin: "", newPin: "", confirmPin: "" },
  });

  const onSubmit = async (values: ChangePinSchema) => {
    form.clearErrors("root");
    const result = await changePinMutation.mutateAsync(values);

    if (!result.success) {
      form.setError("root", { message: result.message });
      form.resetField("currentPin");
      return;
    }

    form.reset();
    window.location.href = "/expanses-log";
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto w-full max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Change security PIN</CardTitle>
          <CardDescription>
            Confirm your current PIN, then choose a different six-digit PIN.
            Other signed-in devices will be locked.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Controller
              control={form.control}
              name="currentPin"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel requiredLable>Current PIN</FieldLabel>
                  <FieldContent>
                    <PinInput
                      {...field}
                      invalid={fieldState.invalid}
                      disabled={changePinMutation.isPending}
                      autoFocus
                    />
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="newPin"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel requiredLable>New PIN</FieldLabel>
                  <FieldContent>
                    <PinInput
                      {...field}
                      invalid={fieldState.invalid}
                      disabled={changePinMutation.isPending}
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
                  <FieldLabel requiredLable>Confirm new PIN</FieldLabel>
                  <FieldContent>
                    <PinInput
                      {...field}
                      invalid={fieldState.invalid}
                      disabled={changePinMutation.isPending}
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
            disabled={changePinMutation.isPending}
          >
            <LoadingSwap isLoading={changePinMutation.isPending}>
              Change PIN
            </LoadingSwap>
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
