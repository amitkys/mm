"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { signIn } from "@/lib/auth-client";

export default function Page() {
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/home",
      });
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <Button size={"lg"} onClick={handleAuth} disabled={loading}>
      <LoadingSwap className="text-lg" isLoading={loading}>
        hi there
      </LoadingSwap>
    </Button>
  );
}
