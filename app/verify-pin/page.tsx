"use client";

import * as React from "react";
import { useState } from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Lock, AlertCircle, LogOut, ShieldAlert } from "lucide-react";
import { useVerifyPinMutation } from "@/app/verify-pin/query/create";
import { authClient, useSession } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function VerifyPinPage() {
  const { data: sessionData } = useSession();
  const userSession = sessionData?.user;

  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  const verifyPinMutation = useVerifyPinMutation();

  const handleVerify = async (enteredPin: string) => {
    if (enteredPin.length !== 4) return;
    setError(null);

    const res = await verifyPinMutation.mutateAsync({ pin: enteredPin });

    if (res.success) {
      setPin("");
      window.location.href = "/expanses-log";
    } else {
      setError(res.message || "Incorrect PIN");
      setIsLocked(Boolean(res.isLocked));
      setPin("");
    }
  };

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/signin";
        },
      },
    });
  };

  const userInitial = userSession?.name?.charAt(0).toUpperCase() || "U";

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4 antialiased select-none">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-2xl space-y-6 text-center animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="relative mx-auto w-fit">
          <Avatar className="h-20 w-20 border-2 border-primary/20 shadow-md">
            {userSession?.image ? (
              <AvatarImage src={userSession.image} alt={userSession.name || "User"} />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
              {userInitial}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
            <Lock className="h-4 w-4" />
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {userSession?.name ? `Welcome back, ${userSession.name}` : "Session Locked"}
          </h1>
          <p className="text-xs text-muted-foreground font-medium">
            {userSession?.email || "Enter your 4-digit security PIN to unlock"}
          </p>
        </div>

        <div className="flex flex-col items-center justify-center space-y-3 py-2">
          <InputOTP
            maxLength={4}
            value={pin}
            onChange={(val) => {
              setPin(val);
              setError(null);
              if (val.length === 4) {
                handleVerify(val);
              }
            }}
            disabled={verifyPinMutation.isPending || isLocked}
            autoFocus
          >
            <InputOTPGroup className="gap-3">
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        {verifyPinMutation.isPending && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Spinner size="xs" />
            <span>Verifying PIN...</span>
          </div>
        )}

        {error && (
          <div className="mx-auto flex max-w-xs items-center justify-center gap-2 rounded-xl bg-destructive/10 p-3 text-xs text-destructive font-medium animate-in fade-in-0">
            {isLocked ? (
              <ShieldAlert className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col gap-2 pt-2 text-xs">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-destructive gap-1.5 rounded-full mx-auto"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>
    </main>
  );
}
