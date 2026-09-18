"use client";

import * as React from "react";
import { useState } from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ShieldCheck, AlertCircle } from "lucide-react";
import { useCreatePinMutation } from "@/app/setup-pin/query/create";

export default function SetupPinPage() {
  const [step, setStep] = useState<"create" | "confirm">("create");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createPinMutation = useCreatePinMutation();

  const handlePinSubmit = async (enteredPin: string) => {
    if (step === "create") {
      if (enteredPin.length !== 4) return;
      setPin(enteredPin);
      setStep("confirm");
      setError(null);
    } else if (step === "confirm") {
      if (enteredPin.length !== 4) return;
      if (enteredPin !== pin) {
        setError("PINs do not match. Please try again.");
        setConfirmPin("");
        return;
      }

      setError(null);
      const res = await createPinMutation.mutateAsync({ pin: enteredPin });
      if (res.success) {
        window.location.href = "/expanses-log";
      } else {
        setError(res.message || "Failed to set up PIN");
      }
    }
  };

  const handleReset = () => {
    setStep("create");
    setPin("");
    setConfirmPin("");
    setError(null);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4 antialiased">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-2xl space-y-6 text-center animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ShieldCheck className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {step === "create" ? "Create Security PIN" : "Confirm Security PIN"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {step === "create"
              ? "Set a 4-digit PIN to protect your financial data whenever you return."
              : "Re-enter your 4-digit PIN to confirm setup."}
          </p>
        </div>

        <div className="flex flex-col items-center justify-center space-y-4 py-2">
          {step === "create" ? (
            <InputOTP
              maxLength={4}
              value={pin}
              onChange={(val) => {
                setPin(val);
                setError(null);
                if (val.length === 4) {
                  handlePinSubmit(val);
                }
              }}
              autoFocus
            >
              <InputOTPGroup className="gap-3">
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
            </InputOTP>
          ) : (
            <InputOTP
              maxLength={4}
              value={confirmPin}
              onChange={(val) => {
                setConfirmPin(val);
                setError(null);
                if (val.length === 4) {
                  handlePinSubmit(val);
                }
              }}
              autoFocus
            >
              <InputOTPGroup className="gap-3">
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
            </InputOTP>
          )}
        </div>

        {error && (
          <div className="flex items-center justify-center gap-2 text-sm text-destructive font-medium animate-in fade-in-0">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-center gap-3 pt-2">
          {step === "confirm" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={createPinMutation.isPending}
              className="rounded-full px-5"
            >
              Start Over
            </Button>
          )}

          {createPinMutation.isPending && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Spinner size="xs" />
              <span>Saving PIN...</span>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
