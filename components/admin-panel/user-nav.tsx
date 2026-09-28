"use client";

import Link from "next/link";
import { LayoutGrid, LogOut } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { LockKeyholeIcon, SecurityLockIcon } from "@hugeicons/core-free-icons";
import { useSession, signOut } from "@/lib/auth-client";
import { useLockPinSessionMutation } from "@/app/verify-pin/query/lock";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserNav() {
  const { data: session } = useSession();
  const lockPinSessionMutation = useLockPinSessionMutation();
  const user = session?.user;

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/signin";
  };

  const handleLock = async () => {
    const result = await lockPinSessionMutation.mutateAsync();
    if (result.success) window.location.href = "/verify-pin";
  };

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name && name.trim()) {
      const parts = name.trim().split(" ");
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            className="relative h-8 w-8 rounded-full p-0 overflow-hidden cursor-pointer"
          />
        }
      >
        <Avatar className="h-8 w-8">
          {user?.image ? (
            <AvatarImage src={user.image} alt={user?.name || "Avatar"} />
          ) : null}
          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
            {getInitials(user?.name, user?.email)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs leading-none text-muted-foreground truncate">
                {user?.email || ""}
              </p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="hover:cursor-pointer"
            render={<Link href="/dashboard" className="flex items-center" />}
          >
            <LayoutGrid className="w-4 h-4 mr-3 text-muted-foreground" />
            Dashboard
          </DropdownMenuItem>
          <DropdownMenuItem
            className="hover:cursor-pointer"
            render={<Link href="/change-pin" className="flex items-center" />}
          >
            <HugeiconsIcon icon={SecurityLockIcon} strokeWidth={2} />
            Change PIN
          </DropdownMenuItem>
          <DropdownMenuItem
            className="hover:cursor-pointer"
            onClick={handleLock}
            disabled={lockPinSessionMutation.isPending}
          >
            <HugeiconsIcon icon={LockKeyholeIcon} strokeWidth={2} />
            Lock now
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="hover:cursor-pointer text-destructive focus:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
