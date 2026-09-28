"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { pinSchema, type PinSchema } from "@/app/setup-pin/lib/zod-type/pin";
import { useVerifyPinMutation } from "@/app/verify-pin/query/verify";
import { authClient, useSession } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

export function VerifyPinForm() {
  const { data: sessionData } = useSession();
  const verifyPinMutation = useVerifyPinMutation();
  const form = useForm<PinSchema>({
    resolver: zodResolver(pinSchema),
    defaultValues: { pin: "" },
  });

  const onSubmit = async (values: PinSchema) => {
    form.clearErrors("root");
    const result = await verifyPinMutation.mutateAsync(values);

    if (!result.success) {
      form.setError("root", { message: result.message });
      form.resetField("pin");
      return;
    }

    window.location.href = "/expanses-log";
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = "/signin";
  };

  const user = sessionData?.user;
  const initial = user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-md">
      <Card>
        <CardHeader className="items-center text-center">
          <Avatar size="lg">
            {user?.image ? <AvatarImage src={user.image} alt={user.name || "User"} /> : null}
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
          <CardTitle>{user?.name ? `Welcome back, ${user.name}` : "Session locked"}</CardTitle>
          <CardDescription>
            Enter your security PIN to unlock your financial data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Controller
              control={form.control}
              name="pin"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel requiredLable>Security PIN</FieldLabel>
                  <FieldContent>
                    <PinInput
                      {...field}
                      invalid={fieldState.invalid}
                      disabled={verifyPinMutation.isPending}
                      autoFocus
                    />
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />
            <FieldError errors={[form.formState.errors.root]} />
          </FieldGroup>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={verifyPinMutation.isPending}
          >
            <LoadingSwap isLoading={verifyPinMutation.isPending}>
              Unlock
            </LoadingSwap>
          </Button>
          <Button type="button" variant="ghost" onClick={handleSignOut}>
            Sign out
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
